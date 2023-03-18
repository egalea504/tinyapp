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
function urlsForUser(id, database) {
  let userURLs = {};
  for (let key in database) {
    const shortURL = database[key];
    if (shortURL.userID === id) {
      userURLs[key] = shortURL;
      }
    }
    return userURLs;
  }

  const getUserByEmail = function(email, database) {
    for (let userID in database) {
      const user = database[userID];
      if (user.email === email) {
        return user;
      }
    }
  };

  module.exports = {
    generateRandomString,
    urlsForUser,
    getUserByEmail
  }