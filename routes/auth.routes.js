const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

// ********* require fileUploader in order to use it *********

const { isAuthenticated } = require("./../middleware/jwt.middleware.js");

const router = express.Router();

const saltRounds = 10;



// Create a new User account
router.post(
  "/register",

    (req, res, next) => {
      const { fname, lname, email, password } = req.body;

      // Check if email or password or name are provided as empty string
      if (email === "" || password === "" || fname === "" || lname === "") {
        res
          .status(400)
          .json({ message: "Please provide a full name, email and password" });
        return;
      }

      // using regex to validate the email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; 
      if (!emailRegex.test(email)) {
        res
          .status(400)
          .json({ message: "Please provide a valid email address" });
        return;
      }


      // using regez to validate the password too
      const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
      if (!passwordRegex.test(password)) {
        res.status(400).json({
          message:
            "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
        });
        return;
      }

      // now we're checking if the same email exists
      User.findOne({ email })
        .then((foundUser) => {
          //if email address is founf
          // Check the users collection if a user with the same email already exists
          if (foundUser) {
            res.status(400).json({ message: "Account already exists." });
            return;
          }
          // if email address is good to go
          // If the user with the same email already exists, send an error response
          const salt = bcrypt.genSaltSync(saltRounds);
          const hashedPassword = bcrypt.hashSync(password, salt);

          // now creating the User's account
          return User.create({
            fname,
            lname,
            email,
            password: hashedPassword,
          });
        })
        .then((createdUser) => {
          const { fname, lname, email, _id } = createdUser;
          const user = { fname, lname, email, _id };
          res.status(201).json({ User: user });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ message: "Interval Server Error" });
        });
    });

//Now the login route
router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  //first checking if inputs are empty
  if (email === "" || password === "") {
    res
      .status(400)
      .json({ message: "please provide a valid email and password." });
    return;
  }

    console.log(req.body);
  // now let's look for the email in the database
  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        //meaning no user found
        res.status(401).json({ message: "User not found." });
        return;
      }

      // comparing the passsword given with the database
      const passswordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passswordCorrect) {
        foundUser
          .populate("currentLoads previousLoads")
          .then((populatedUser) => {
            //deconstruct info from database
            const { _id, fname, lname, email, currentLoads, previousLoads } =
              populatedUser;
            //created object for the token
            const payload = {
              _id,
              fname,
              lname,
              email,
              currentLoads,
              previousLoads,
            };
            //create and sign the token
            const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
              algorithm: "HS256",
              expiresIn: "8h",
            });

            //now we send the token as a response
            console.log(authToken);
            res.status(200).json({ authToken: authToken });
          })
          .catch((err) =>
            res.status(500).json({ message: "Internal Server Error" })
          );
      } else {
        res.status(401).json({ message: "Unable to authenticate the User" });
      }
    })
    .catch((err) => res.status(500).json({ message: "Internal Server Error" }));
});



// GET  /auth/verify  -  Used to verify JWT stored on the client
router.get("/verify", isAuthenticated, (req, res, next) => {
  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and made available on `req.payload`
  console.log(`req.payload`, req.payload);

  // Send back the object with user data
  // previously set as the token payload
  res.status(200).json(req.payload);
});

module.exports = router;
