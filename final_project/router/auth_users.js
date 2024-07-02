const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
require('dotenv').config();
let privateKey = process.env.jwtSecretKey;

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  let {username,password} = req.body;
  let isRegistered = false;
  for(let i=0;i<users.length;++i){
    if(users[i]['username']===username){
      if(users[i]['password']===password){
        isRegistered = true;
        break;
      }
    }
  }
  if(isRegistered){
    let token = jwt.sign({username,role:'customer'},privateKey);
    res.status(200).json({loginnedSuccessfully:true,token});
  }
  else
  res.status(200).json({loginnedSuccessfully:false,reason:'username or password is wrong'});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    let {username,review} = req.body;
    let isbnBookFound = false;
    Object.values(books).forEach((value)=>{
      if(value.isbn === req.params.isbn){
        isbnBookFound = true;
        let reveiwAlreadyAdded = false;
        for(let i=0;i<value.registeredCustomerReviews.length;++i){
          if(value.registeredCustomerReviews[i].username === username){
            reveiwAlreadyAdded = true;
            value.registeredCustomerReviews[i] = {username,review};
            break;
          }
        }
        if(!reveiwAlreadyAdded)
          value.registeredCustomerReviews.push({username,review});
      }
    });
    if(isbnBookFound)
    res.status(200).json({reviewAdded:true});
    else
    res.status(200).json({reviewAdded:false,reason:'no book is found for given isbn'});
});

regd_users.delete("/auth/review/:isbn",(req,res)=>{
  let {username} = req.body;
  let isbnBookFound = false;
  let reviewExists = false;
  Object.values(books).forEach((value)=>{
    if(value.isbn === req.params.isbn){
      isbnBookFound = true;
      for(let i=0;i<value.registeredCustomerReviews.length;++i){
        if(value.registeredCustomerReviews[i].username === username){
          reviewExists = true;
          value.registeredCustomerReviews.splice(i,1);
          break;
        }
      }
    }
  })
  if(!isbnBookFound)
    res.status(200).json({reviewDeleted:false,reason:'no book is found for given isbn'});
  if(!reviewExists)
    res.status(200).json({reviewDeleted:false,reason:'no review found under this isbn book'});
  else
    res.status(200).json({reviewDeleted:true});

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;