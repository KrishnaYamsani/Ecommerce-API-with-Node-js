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


//Server
app.listen(3000,function (){
    console.log("Server started on port 3000");
})