const fs = require("fs");

class database {
  constructor(path) {
    this.path = path;
    this.users = require(this.path);
  }

  save() {
    fs.writeFile(this.path, JSON.stringify(this.users, null, 2), "utf8");
  }
}

const
  dbPath = __dirname + "/users.json",
  reqPath = "/v1/:endpoint",

  express = require("express")(),
  bodyParser = require("body-parser"),
  bearerToken = require("express-bearer-token"),
  hat = require("hat"),

  db = new database(dbPath),

  createUser = (email, password) => {
    const token = hat();

    db.users[token] = {
      "email": email,
      "password": password,
      "integer": 1
    };

    db.save();

    return token;
  },

  setInteger = (token, integer) => {
    if (typeof integer === "number") {
      db.users[token].integer = integer;
    } else {
      db.users[token].integer++;
    }

    db.save();
  },

  confirmAuth = (token) => {
    return (typeof db.users[token] === "object");
  },

  checkEndPoint = (req) => {
    if (req.params.endpoint === "register") {
      if (req.body.email && req.body.password) {
        return createUser(req.body.email, req.body.password);
      }

      return "An email address and a password are required for registration.";
    }

    if (req.token && confirmAuth(req.token)) {
      if (req.params.endpoint === "next") {
        setInteger(req.token);
      } else if (req.body.current) {
        const newInt = parseInt(req.body.current);

        if (newInt < 0) {
          return "Integer must be a non-negative value.";
        }

        setInteger(req.token, newInt);
      }

      return db.users[req.token].integer.toString();
    }

    return "REST endpoint secured. API key is required.";
  },

  reqHandler = (req, res) => {
    if (req.params.endpoint) {
      res.send(checkEndPoint(req));
    } else {
      res.send("REST endpoint required.");
    }
  };

express.use(bearerToken());
express.use(bodyParser.urlencoded({ extended: false }));

express.get(reqPath, reqHandler);
express.put(reqPath, reqHandler);
express.post(reqPath, reqHandler);

express.listen(3000, function() {
  console.log("Listening @ http://localhost:3000/v1/ ...");
});