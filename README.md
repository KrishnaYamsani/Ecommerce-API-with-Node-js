<h3 align="center">REST API FOR ECOMMERCE APPLICATION</h3> 
<br>

## Inventive Choices

<ol> There are a few decisions that I took during the project which I thought would be worth To mention here. </ol>
<ol> When a new user is registered successfully I created a cart for the 
user in carts table. This is implemented by using trigger which triggers after insertion on users table.</ol>
<ol> Every time A user adds items to the carts,Available items field for that product in products table won't be changed.</ol>
<ol> After succefull completion of order which in this case adding items in orders table,corresponding products quantity is updated using triggers.It will trigger after insertion on oreders table.</ol>

## Routes
## Register
<br>Path : '/register'
| Parameters | Description |
|------------|-------------|
|Username  | Username for your account |
|Password  | Your account password |
|Email | Your Email address |
|Phone Number | Phone number for our reference |
<br>
Response:
<br>
You will get a json consisting of details provided by you as well as your user id.
<br>If username you provided already exists you will get an error with message "Username already exists".

## Login
Path : '/login'
| Parameters | Description |
|------------|-------------|
|Username  | Username for your account |
|Password  | Your account password |
<br>
Response:
<br>
If provided ussername and password are valid you will get an access token.
<br>
Error:
<br>
You will get an error if usercredentials are not valid.

## Get All Categories
Path : '/categories'
<br>
Response :
<br>
All categories and there details will be sent.

## Get All Products Of A Category
Path : '/category/:categoryid'
<br>
Url includes category id of category for which You are interested to find list of products.
<br>
Response :
<br>
All Products under that category if category id is valid otherwise you will receive invalid category id message.
<br>{
    'title' ,
    'price' ,
    'description' ,
    'Number of items available' ,
}

## Get Details Of A Product
Path : '/products/:productid'<br>
Url includes product id for which You are interested in.<br>
Response :<br>
All Details of the Product if product id is valid otherwise you will receive invalid product id message.

## Cart
Path : '/cart/:cartid'<br>
Each cart id uniquly identifies each user cart.<br>

Error: <br>
For each method if cartid is not valid you will receive an error.<br><br>

# Method: Get<br>
Response: You will receive all your cart items.<br>
<br>{ "Item Number" ,'Cart item id' ,'Product' ,'Price'  , 'Quantity' }

# Method: Post
To add items to your cart<br>
| Parameters | Description |
|------------|-------------|
|Product Id  | Product you want to add to your cart |
|Quantity  | How many products you want to buy |

Response:<br>
You will get a json consisting of your item details and a cart-item-id for identifying your present added item.<br>

# Method: Put
To make changes to your cart
| Parameters | Description |
|------------|-------------|
|Cart item id  | Unique id  |
|Update field  | Whether you want to update product or quantity |
|Quantity or Product  | new value|

<br>Response:
<br>You will get an updated json consisting of your item details and a cart-id.

# Method: Delete
<br>To delete your cart
| Parameters | Description |
|------------|-------------|
|Cart item id  | Unique id  |

<br>Response:
<br>You will get details of the cart you deleted in json.

## Place An Order
<br>Path : '/order/:cartid'
<br>Method: Post

| Parameters | Description |
|------------|-------------|
|Cart item id  | Unique id  |

<br>Each cart id to uniquly identify each user and cart item id to place items in that cart for order.

<br><br>Response:
<br>You will receive order details including order reference number.
<br>If your cart don't have any items, yoy will recieve a message that you don't have any items in your cart or your cart item id is not valid.

## Order History
<br>Path : '/orderHistory/user/:user'
<br>Method: Get
<br> user is your user id.
<br>Response:
<br>You will get all your previous order details.
<br>{ 'Order number' ,'Time stamp' ,'Product Name' , 'Price of each product (in INR)' ,'Quantity'}

## Order Detail
<br>Path : '/order/:order'
<br>Method: Get
<br>order is your order id.
<br>Response:
<br>You will get that order details.
<br>It will of the form 
<br>{ 'Order Number' ,'Username' ,  'Timestamp' , 'Product' , 'Price' , 'Quantity' }
