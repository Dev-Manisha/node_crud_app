// imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const app = express()
const port = process.env.PORT || 4000

// mongoose.connect(process.env.DB_URI, {
//     maxPoolSize:50,
//     wtimeoutMS:2500,
//     useNewUrlParser:true
// })
// const db = mongoose.connection;
// db.on('error', (error) =>{
//     console.log('MongoDB connection error:',error)
// })
// db.once('open', ()=>{
//     console.log("database connected successfully!!")
// })

// Connect to MongoDB
mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });


//Middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json())

app.use(session({
    secret:'my secret key',
    saveUninitialized: true,
    resave: false
}))

app.use((req,res,next) =>{
    res.locals.message = req.session.message
    delete req.session.message;
    next();
});

app.use(express.static(__dirname + '/uploads'))

// set template Engine
app.set("view engine", "ejs")

// route prefix
app.use("", require('./routes/routes'))


app.listen(port, ()=>{
    console.log(`server started at http:localhost:${port}`)
})