const express = require('express');
const bodyparser = require('body-parser');
const pg = require('pg');
const pool = require('./db');
const app = express();

// DB connection
const connection = "postgres://ecommerce_2apz_user:jOObwwOgw3COPML0lCnwChAROC0v79j0@dpg-cnd53led3nmc738jn2a0-a.singapore-postgres.render.com/ecommerce_2apz" ;

// Body parser middleware
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));

app.get('/',(req,res) => {
    res.send("Welcome to API, Do enjoy our services.")
})



app.get('/categories',async (req,res) => {

    const result = await pool.query('SELECT * FROM CATEGORY');
    res.send(result.rows);

})

app.get('/category/:categorie', async (req,res) => {

    let categorieid = req.params.categorie ;
    const result = await pool.query(`SELECT * FROM PRODUCTS WHERE CATEGORIE_ID = $1`,[categorieid]);
    let products = result.rows.map((product) => {
        return {
            title : product.title,
            price : product.price,
            description : product.description,
            'Number of items available' : product.available_items > 0 ? 'Yes' : 'No' 
        }
    });

    products = products.length != 0  ? products : 'No available products in the provided category ' + categorieid ;
    res.send(products);
})

app.get('/products/:product', async (req,res) => {

    let productid = req.params.product ;
    const result = await pool.query(`SELECT * FROM PRODUCTS WHERE PRODUCT_ID = $1`,[productid]);
    let products = result.rows;

    products = products.length != 0  ? products : 'No available products with the product id ' + productid ;
    res.send(products);
})

app.get('/orderHistory/user/:user', async (req,res) => {

    let userid = req.params.user ;
    const result = await pool.query(`SELECT * FROM ORDERS,PRODUCTS WHERE USER_ID = $1 AND ORDERS.PRODUCT_ID = PRODUCTS.PRODUCT_ID`,[userid]);
    let orders = result.rows.map((order) => {
        return {
            'Order number' : order.order_id,
            'Time stamp'   : order.order_date,
            'Product Name' : order.title,
            'Price of each product (in INR)' : order.price,
            'Quantity'     : order.quantity,
        }
    });

    orders = orders.length != 0  ? orders : 'User with user id: ' + userid + 'did not place any orders';
    res.send(orders);
})

app.get('/order/:order', async (req,res) => {

    let orderid = req.params.order ;
    const result = await pool.query(`SELECT * FROM ORDERS,PRODUCTS,USERS WHERE ORDER_ID = $1 AND ORDERS.PRODUCT_ID = PRODUCTS.PRODUCT_ID AND ORDERS.USER_ID = USERS.USER_ID `,[orderid]);
    let order = result.rows.map((order) => {
        return {
            'Order Number' : order.order_id,
            'Username'     : order.user_name,
            'Timestamp'    : order.order_date,
            'Product'      : order.title,
            'Price'        : order.price,
            'Quantity'     : order.quantity
        }
    });

    order = order.length != 0  ? order : 'No order with the order id ' + orderid ;
    res.send(order);
})
//Server
app.listen(3000,function (){
    console.log("Server started on port 3000");
})