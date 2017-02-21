const fs = require("fs");

class database {
  constructor(path) {
    this.path = path;
    this.users = require(this.path); // Load json database file
  }

  save() { // Write changes to json database file
    fs.writeFile(this.path, JSON.stringify(this.users, null, 2), "utf8");
  }
}

const
  express = require("express")(),
  bodyParser = require("body-parser"),
  bearerToken = require("express-bearer-token"),
  hat = require("hat"),

  db = new database(__dirname + "/users.json"),

  findToken = (email, password) => { // Search database for existing credentials
    for (let token in db.users) {
      if (db.users[token].email === email && db.users[token].password === password) {
        return token; // Return API key (if credentials exist)
      }
    }
  },

  confirmAuth = (token) => {
    return (typeof db.users[token] === "object");
  },

  createUser = (email, password) => { // Create new user with API key (if required)
    const token = findToken(email, password) || hat();

    if (!confirmAuth(token)) { // Create user structure if non-existent
      db.users[token] = {
        "email": email,
        "password": password,
        "integer": 1
      };

      db.save();
    }

    return token;
  },

  setInteger = (token, integer) => {
    db.users[token].integer = (
      integer ?
      integer :
      db.users[token].integer + 1
    );

    db.save();
  },

  checkEndPoint = (req) => {
    if (req.params.endpoint === "register") {
      return (
        (req.body.email && req.body.password) ?
        createUser(req.body.email, req.body.password) :
        "An email address and password are required for registration."
      );
    }

    if (req.token && confirmAuth(req.token)) {
      if (req.params.endpoint === "next") { // Increment integer by 1
        setInteger(req.token);
      } else if (req.body.current) { // Set integer to specified value
        const newInt = parseInt(req.body.current);

        if (newInt < 0) { // Disallow non-negative integers
          return "Integer must be a non-negative value.";
        }

        setInteger(req.token, newInt);
      }

      return db.users[req.token].integer.toString(); // Respond with current integer
    }

    return "REST endpoint secured. API key is required.";
  },

  reqHandler = (req, res) => {
    res.send(
      req.params.endpoint ?
      checkEndPoint(req) :
      "REST endpoint required."
    );
  }
;

express
  .use([
    bearerToken(),
    bodyParser.urlencoded({ extended: false })
  ])

  .route("/v1/:endpoint") // Monitor GET/PUT/POST requests
    .get(reqHandler)
    .put(reqHandler)
    .post(reqHandler)
;

express.listen(3000, () => {
  console.log("Listening on port 3000.");
});