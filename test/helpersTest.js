const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');


const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const testUrlDatabase = {
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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    };
    assert.deepEqual(user,expectedUserID);
  });

  it('should return undefined with an invalid email', function() {
    const user = getUserByEmail("joel@example.com", testUsers);
    const expectedUserID = undefined;
    assert.deepEqual(user,expectedUserID);
  })
});

describe('urlsForUser', function() {
  it('should return urls list for valid user', function() {
    const urls = urlsForUser("userRandomID", testUrlDatabase);
    const expectedUrls = { b2xVn2: { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
    ssm5xK: { longURL: 'http://www.google.com', userID: 'userRandomID' }};
    assert.deepEqual(urls,expectedUrls);
  });

  it('should return an empty object for an invalid user', function() {
    const urls = urlsForUser("userRandomID3", testUrlDatabase);
    const expectedUrls = {};
    assert.deepEqual(urls,expectedUrls);
  });
});