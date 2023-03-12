const express = require("express");
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

//will render urls_register form created
app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: req.cookies["email"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: req.cookies["email"]
  };
  res.render("urls_new", templateVars);
});

// display the long and short URL on the url ID page
app.get("/urls/:id", (req, res) => {
  const templateVars = { user: req.cookies["user_id"],
    id: req.params.id, longURL: urlDatabase[req.params.id]
     };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const data = req.body;
  data.url = data.longURL;

  const newKey = generateRandomString();
  urlDatabase[newKey] = data.url;
  const templateVars = { id: newKey, longURL: data.url,
    // added user key to template vars so it can render urls_show
  user: req.cookies["email"]
};
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  console.log(req.body); // Log the POST request body to the console

  const id = req.params.id;

  const newURL = req.body.longURL;

  urlDatabase[id] = newURL;
  const templateVars = { id, longURL: newURL,
    user: req.cookies["email"] 
  };
  res.render("urls_show", templateVars);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const inputtedEmail = req.body.email;
  const inputtedPassword = req.body.password;
  for (let userID in users) {
    if (users[userID].email === inputtedEmail) {
      if (users[userID].password === inputtedPassword) {
        res.cookie("user_id", users[userID].id);
        res.cookie("email", users[userID].email);
        res.redirect("/urls");
      }
    }
    
  }
  res.status(403).send("Error 403. Information doesn't match. Please try again.");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  const templateVars = {
    user: null,
    urls: urlDatabase
  };
  res.redirect("/login");
});

// process to save cookies email and password
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

  userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: dataUser.email,
    password: dataUser.password
  };

  res.cookie("user_id", users[userID].id);
  res.cookie("email", users[userID].email);
  console.log(users);
    // added user key to template vars so it can render urls_show
    res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});