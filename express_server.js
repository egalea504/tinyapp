const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

// function generates random string which will be used to generate random ID for url and user
function generateRandomString() {
  let characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  let stringLength = 6;

  let randomString = "";

  for (let i = 0; i < stringLength; i++) {
    let randomNumber = Math.floor(Math.random() * characters.length);
    randomString += characters[randomNumber];
  }
  return randomString;
}

// function used to return all URLs linked to unique user
function urlsForUser(id) {
  let userURLs = {};
  for (let key in urlDatabase) {
    const shortURL = urlDatabase[key];
    if (shortURL.userID === id) {
      userURLs[key] = shortURL;
      }
    }
    return userURLs;
  }

// url database contains short and long urls for each user
const urlDatabase = {
  b2xVn2: {
  longURL: "http://www.lighthouselabs.ca",
  userID: "userRandomID",
},
  ssm5xK: {
   longURL: "http://www.google.com",
   userID: "userRandomID",
  },
  m2wFq6: {
    longURL: "https://www.youtube.com",
    userID: "user2RandomID",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// login page - if not connect, render login page or if connected redirect to urls page
app.get("/login", (req, res) => {
  if (!req.session.email) {
    res.render("urls_login");
  } else {
  
  res.redirect("/urls")
  }
});

// render register form if not signed in
app.get("/register", (req, res) => {
  if (!req.session.email) {
    res.render("urls_register");
    
  } else {
    res.redirect("/urls")
  }
});

// render urls page if signed in, error message if not
app.get("/urls", (req, res) => {
  if (!req.session.email) {
    res.send("You do not have access to this page. Please log in to view your saved URLs.");
  }
  const templateVars = {
    user: req.session.email,
    urls: urlsForUser(req.session.user_id)
  };

  res.render("urls_index", templateVars);
});

// render new url page if signed in, error message if not
app.get("/urls/new", (req, res) => {
  if (!req.session.email) {
    res.redirect("/login");
  }

  const templateVars = {
    user: req.session.email
  };

  res.render("urls_new", templateVars);
});

// display the long and short URL on the url ID page
app.get("/urls/:id", (req, res) => {
  if (!req.session.email) {
    res.send("You do not have access to this page. Please log in to view your saved URLs.");
  }

  const templateVars = { user: req.session.email,
    id: req.params.id, longURL: urlDatabase[req.params.id].longURL
     };

  res.render("urls_show", templateVars);
});

// post to urls if signed in, else error message
app.post("/urls", (req, res) => {
  if (!req.session.email) {
    res.send("Login required to shorten URLs.")
  }

  console.log(req.body); // Log the POST request body to the console

  const newKey = generateRandomString();
  urlDatabase[newKey] = {longURL: req.body.longURL, userID: req.session.user_id}
  const templateVars = { id: newKey, longURL: req.body.longURL,
    // added user key to template vars so it can render urls_show
  user: req.session.email
};

  res.render("urls_show", templateVars);
});

// redirect to longURL if it exists in database
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id].longURL) {
    res.send("URL does not exist.");
  }
  
  const longURL = urlDatabase[req.params.id].longURL;

  res.redirect(longURL);
});

// delete short url from urls, error message if not signed in
app.post("/urls/:id/delete", (req, res) => {
  if (!req.session.email) {
    res.send("You do not own this content. Please log in to view your URLs.")
  }

  const id = req.params.id;
  delete urlDatabase[id];

  res.redirect("/urls");
});

// post to urls id if signed in, else error message
app.post("/urls/:id", (req, res) => {
  if (!req.session.email) {
    res.send("You do not own this content. Please log in to view your URLs.")
  }

  console.log(req.body); // Log the POST request body to the console

  const id = req.params.id;

  urlDatabase[id].longURL = req.body.longURL;

  res.redirect("/urls");
});

// login form
app.post("/login", (req, res) => {
  const inputtedEmail = req.body.email;
  const inputtedPassword = req.body.password;
  // check if email and password match, else error message
  for (let userID in users) {
    if (users[userID].email === inputtedEmail) {
      if (bcrypt.compareSync(inputtedPassword, users[userID].password)) {
        req.session.user_id = users[userID].id;
        req.session.email = users[userID].email;

        res.redirect("/urls");
      }
    }
    
  }
  res.status(403).send("Error 403. Information doesn't match. Please try again.");
});

// logout button clears session
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  req.session.email = null;

  res.redirect("/login");
});

// process to register email and password cookies
app.post("/register", (req, res) => {
  console.log(req.body);
  //checking if email input or password input are empty - if empty send 404 error
  if (!req.body.email || !req.body.password) {
    res.status(404).send('404 Not Found');
  } 
  // looping through users key - if key.email equals inputted email - send error message
  for (let userID in users) {
    if (users[userID].email === req.body.email) {
      res.status(404).send("It looks like you're already registered!");
    }};

  const dataUser = req.body;
  let password = dataUser.password

  userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: dataUser.email,
    password: bcrypt.hashSync(password, 10),
  };

  req.session.user_id = users[userID].id;
  req.session.email = users[userID].email;

    // added user key to template vars so it can render urls_show
    res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});