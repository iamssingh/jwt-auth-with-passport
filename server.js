/*We are going to add simple authentication to our website
We are going to collect data(email and password) entered by
user in the HTML form, created in the INDEX.HTML file, and
we are going to store that data in our database
this is how we can simply register any new user */

/* if we want to log in our already registered user,
then we collect email and password from HTML
form created in LOGIN.HTML file, and
we can find data(if any) associated with this
email, and return it to user */


const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require("body-parser");

// Allowing app to use body parser
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
  
// Below all the app.use methods
app.use(session({
    secret: "any long secret key",
    resave: false,
    saveUninitialized: false
}));

// Initializing Passport
app.use(passport.initialize());

// Starting the session
app.use(passport.session());

// Creating user schema and adding a plugin to it

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
userSchema.plugin(passportLocalMongoose);

// Connecting mongoose to our database
// named "test"
mongoose.connect(
    'mongodb+srv://ssingh:lexOVgwSLGt9hNWQ@cluster0.idjex.mongodb.net/test?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

// Creating the User model.
const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());
  
// Serializing and deserializing
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* setting a simple get request on the home route,
and sending our index.html file containing a form
which will allow user to enter his details and
register. */
app.get("/", function (req, res) {
  
  /* req.isAuthentcated() returns true or 
  false depending upon whether a session 
  is already running or not.*/
  if(req.isAuthenticated()) {   
    /* if the request is already authenticated, 
    i.e. the user has already logged in and 
    there is no need to login again. Or we 
    can say, the session is running. */  
    res.send("You have already logged in. No need to login again");
  }
  else{
    // If the user is new and no session
    // is Running already 
    res.sendFile(__dirname + "/index.html");
  }
});

app.get("/login", function(req, res) {
    if(req.isAuthenticated()){
        /* if request is already authenticated, 
        i.e. user has already logged in and 
        there is no need to login again. */ 
        res.send("You have already logged in. No need to login again");
     }
     else{
       res.sendFile(__dirname + "/login.html");
   }
})

// Handling the post request on /register route.
app.post("/register", function(req, res){
    console.log(req.body);
    
    // Getting Email and PAssword Entered by user
    var email = req.body.username;
    var password = req.body.password;
      
    /* Registering the user with email and
    password in our database  
    and the model used is "User" */
    User.register({ username : email }, 
    req.body.password, function (err, user) {      
      if (err) {
        
        // if some error is occurring, log that error
        console.log(err);
      }
      else {
        passport.authenticate("local")
        (req, res, function() {
          res.send("successfully saved!"); 
        })
      }
    })
})

app.post("/login", function(req, res) {
    console.log(req.body);
  
    const userToBeChecked = new User({
      username: req.body.username,
      password: req.body.password,
    });
    
    // Checking if user if correct or not
    req.login(userToBeChecked, function (err) {
      if (err) {
    
        console.log(err);
          
        // If authentication fails, then coming
        // back to login.html page
        res.redirect("/login");
      } else {
        passport.authenticate("local")(
          req, res, function () {
          User.find({ email: req.user.username }, 
            function (err, docs) {
            if (err) {
              console.log(err);
            } else {
              //login is successful
              console.log("credentials are correct");
              res.send("login successful");
            }
          });
        });
      }
    });
})

// Allowing app to listen on port 3000
app.listen(3000, function () {
    console.log("server started successfully");
})
