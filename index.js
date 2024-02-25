require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
const pg = require('pg');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const limiter = require('./ratelimit');
const app = express();

// DB connection
const connection = "postgres://ecommerce_2apz_user:jOObwwOgw3COPML0lCnwChAROC0v79j0@dpg-cnd53led3nmc738jn2a0-a.singapore-postgres.render.com/ecommerce_2apz" ;

// Body parser middleware
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));

//express middleware
app.use(express.json());
app.use(limiter);

// User function 

function generateToken (user) {
    return jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn : '60m'});
}
// Routes 

app.get('/',(req,res) => {
    res.send("Welcome to API, Do enjoy our services.")
})

app.post('/register',bodyparser.json(),async (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const phonenumber = req.body.phonenumber;

    let result = await pool.query(`SELECT USER_ID FROM USERS WHERE USER_NAME = $1 `,[username]);

    if(result.rows){
        res.sendStatus(401).send({
            message:"User name already exists try a unique username"
        })
    }

    try
    {
        result = await pool.query(`INSERT INTO USERS (USER_NAME,PASSWORD,EMAIL,PHONE_NUMBER) VALUES ($1,$2,$3,$4)`,[username,password,email,phonenumber])
    }catch(e){
        res.sendStatus(400).send({
            message : e.message
        })
    }
    
    res.send(results.row[0]);

})

app.post('/login',bodyparser.json(),async (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    const result = await pool.query(`SELECT USER_ID FROM USERS WHERE USER_NAME = $1 AND PASSWORD = $2`,[username,password]);

    if ( !result.rows[0] ){
        res.sendStatus(401).send({
            message : "Invalid user credentials"
        })
    }

    const user = { name : username } ;
    const accesstoken = generateToken(user);

    res.json({accesstoken : accesstoken});

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

app.route('/cart/:cartid(\\d+)')
    .all(authenticateToken,(req,res,next) => {
        const cartid = req.params.cartid;
        if(!cartid){
            res.sendStatus(404).send({
                message : "Send a valid cartid"
            })
        }

        next();
    })
    .get(async (req,res) => {
        
        const cartid = req.params.cartid;
        const result = await pool.query(`SELECT * FROM CART_ITEMS , PRODUCTS WHERE CART_ID = $1 AND PRODUCTS.PRODUCT_ID = CART_ITEMS.PRODUCT_ID`,[cartid]);
        let orders = result.rows.map((item,index) => {
            return {
                "Item Number" : index+1 ,
                'Cart item id': item.cart_item_id,
                'Product'     : item.title,
                'Price'       : item.price,
                'Quantity'    : item.quantity
            }
        })
        
        orders = orders.length != 0  ? orders : 'User with user id: ' + userid + 'has empty cart.';
        res.send(orders);
    })
    .post(bodyparser.json(), (async (req,res) => {

        let item = req.body;
        const cartid = req.params.cartid;

        let result = await pool.query(`INSERT INTO CART_ITEMS (cart_id, product_id, quantity) VALUES ($1,$2,$3) RETURNING *`,[cartid,item.product_id,item.quantity]);
        
        res.send(result.rows[0]);
    }))
    .put(async (req,res) => {
        
        let update_field = req.body.update;
        let cart_item_id = req.body.cart_item_id;

        if(!cart_item_id){

            res.status(400).send({
                message:'cart item id should be included'
            });

        }

        if(update_field === 'product_id'){
            let newproduct = req.body.product_id ; 

            if(!newproduct){
                res.status(400).send({
                    message:'For updating proudct, product id should be included'
                });
            }

            const result = await pool.query(`UPDATE CART_ITEMS SET PRODUCT_ID = $1 WHERE CART_ITEM_ID = $2 RETURNING *`,[newproduct,cart_item_id]);
            res.send(result.rows);
        }else if(update_field === 'product_id'){
            let newquantity = req.body.quantity ; //check if product_id is not null

            if(!newquantity){
                res.status(400).send({
                    message:'For updating Quantity, quantity should be included'
                });
            }

            const result = await pool.query(`UPDATE CART_ITEMS SET QUANTITY = $1 WHERE CART_ITEM_ID = $2 RETURNING *`,[newquantity,cart_item_id]);
            res.send(result.rows);
        }

    })
    .delete(async (req,res) => {

        let cart_item_id = req.body.cart_item_id;

        if(!cart_item_id){

            res.status(400).send({
                message:'cart item id should be included'
            });

        }

        const result = await pool.query(`DELETE FROM CART_ITEMS WHERE CART_ITEM_ID = $1 RETURNING *`,[cart_item_id]);

        res.send(result.rows);
    });
    
app.post('/order/:cartid',authenticateToken,bodyparser.json(),async (req,res) => {

    const cartid = req.params.cartid;
    if(!cartid){
        res.sendStatus(404).send({
            message : "Send a valid cartid"
        })
    }

    let cart_item_id = req.body.cart_item_id;
    let result = await pool.query(`INSERT INTO ORDERS (USER_ID,PRODUCT_ID,QUANTITY) SELECT C.USER_ID , I.PRODUCT_ID , I.QUANTITY FROM CARTS C,CART_ITEMS I WHERE C.CART_ID = I.CART_ID AND I.CART_ITEM_ID = $1 RETURNING *`,[cart_item_id]);

    res.send(result.rows[0]);
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

// Custom middleware

function authenticateToken(req,res,next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token){
        return res.sendStatus(401);
    }

    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, (err,user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next()
    })
}
//Server
app.listen(3000,function (){
    console.log("Server started on port 3000");
})