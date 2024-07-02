const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
require('dotenv').config();
let privateKey = process.env.jwtSecretKey;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    let token = req.headers['authorization'].split(' ')[1];
    if(!token)
        res.status(400).send("Token is not present");
    else{
        let payload = jwt.verify(token,privateKey);
        if(!payload.username)
            res.status(200).send("something is fishy try to login again");
        else
        next();
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log(`Server is running in http://localhost:${PORT}`));
