const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  let {username,password} = req.body;
  if(!username || !password)
    res.status(200).json({accountCreated:false,reason:'username or password is empty'});
  else{
    let isUserAlreadyExists = false;
    for(let i=0;i<users.length;++i){
      if(users[i]['username']===username){
        isUserAlreadyExists = true;
        break;
      }
    }
    if(isUserAlreadyExists){
      res.status(200).json({accountCreated:false, reason:'account with username already exists'});
    }
    else{
      users.push({username,password});
      res.status(200).json({accountCreated:true});
    }
  }
});

//Using Promises
const returnAPromise = (searchBy,currentValue) => {
  if(searchBy === 'all' && currentValue === 'all'){
    return new Promise((resolve,reject)=>{
      let booksFound = {};
      let counter = 1;
      try{
        Object.values(books).forEach((value)=>{
          booksFound[counter++] = {
            'ISBN' : value.isbn,
            'Title':value.title,
            'Author' : value.author,
            'Review' : value.reviews
          };
        });
        resolve(booksFound);
      }
      catch(e){
        reject("Error while fetching book details");
      }
    });
  }

  return new Promise((resolve,reject)=>{
    try{
      let booksFound = {};
      let counter = 1;
      let obj = {};
      Object.values(books).forEach((value)=>{
        if(value[`${searchBy}`]===currentValue){
          switch(searchBy){
            case 'isbn':
              obj['Author']= value.author,
              obj['Title'] = value.title,
              obj['Review'] = value.reviews
            break;
            case 'author':
              obj['ISBN']= value.isbn,
              obj['Title'] = value.title,
              obj['Review'] = value.reviews
            break;
            case 'title':
              obj['ISBN']= value.isbn,
              obj['Author'] = value.author,
              obj['Review'] = value.reviews
            break;
          }
          booksFound[counter++] = obj;
        }
      });
      if(Object.values(booksFound).length===0)
        booksFound={books:`no books found for the given ${searchBy}`}
      resolve(booksFound);
    }
    catch(e){
      reject(`Error while fetching Book details under ${searchBy}`);
    }
  })
}


// Get the book list available in the shop
public_users.get('/',function (req, res) {
  returnAPromise("all","all").then((result)=>{
    res.status(200).json(result);
  }).catch((error)=>{
    res.status(400).send(error);
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  returnAPromise("isbn",req.params.isbn).then((result)=>{
    res.status(200).json(result);
  }).catch((error)=>{
    console.log(error);
    res.status(400).send(error);
  })
});

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  returnAPromise('author',req.params.author).then((result)=>{
    res.status(200).json(result);
  }).catch((error)=>{
    console.log(error);
    res.status(400).send(error);
  })
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  returnAPromise("title",req.params.title).then((result)=>{
    res.status(200).json(result);
  }).catch((error)=>{
    console.log(error);
    res.status(400).send(error);
  })
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  let bookReviews = {};
  let counter = 1;
  Object.values(books).forEach((value)=>{
    if(value['isbn']===req.params.isbn)
      bookReviews[counter++] = {
        'Author' : `${value['author']}`,
        'Title' : `${value['title']}`,
        "Review" : value['reviews']
      }
  })
  if(Object.values(bookReviews).length===0)
    bookReviews = {reviews : "no books reviews found for given isbn"}
  res.status(200).json(bookReviews);
});

module.exports.general = public_users;
