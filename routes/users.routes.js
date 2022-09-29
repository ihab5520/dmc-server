const mongoose = require("mongoose");
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User.model");


const saltRounds = 10;

//  GET /api/users/:userId -  Retrieves a specific user by id
router.get("/:userId", (req, res, next) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  User.findById(userId)
    .then((user) => res.status(200).json(user))
    .catch((error) => res.json(error));
});

// PUT  /api/users/:userId  -  Updates a specific user by id
router.put(
  "/:userId",
  fileUploader.single("profilePic"),
  async (req, res, next) => {
    // console.log("file is: ", req.file)

    if (!req.file) {
      next(new Error("No file uploaded!"));
      return;
    }

    const { userId } = req.params;
    const { email, password, fname, lname, existingProfilePic } = req.body;

    let profilePic;
    if (req.file) {
      profilePic = req.file.path;
    } else {
      profilePic = existingProfilePic;
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }

    // Check if email or password or name are provided as empty string
    if (email === "" || password === "" || fname === "" || lname === "") {
      res.status(400).json({ message: "Provide email, password and name" });
      return;
    }

    // Use regex to validate the email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: "Provide a valid email address." });
      return;
    }

    // Use regex to validate the password format
    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({
        message:
          "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
      });
      return;
    }

    // Check the users collection if a user with the same email already exists
    /*User.findOne({ email })
     .then((foundUser) => {
     If the user with the same email already exists, send an error response
     if (foundUser) {
      res.status(400).json({ message: "User already exists." });
     return;
      } */ //closing curly bracket confusion

    let user = await User.findOne({ email });
    console.log(user);
    if (user) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // If email is unique, proceed to hash the password
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    try {
      user = await User.findByIdAndUpdate(
        userId,
        { email, password: hashedPassword, fname, lname, profilePic },
        { new: true }
      );
      // deconstruct the user object to omit the password & send the JSON response that includes the updated user object, without the password
      res.status(201).json({
        email,
        fname,
        lname,
        profilePic: req.file.path,
        _id: user._id,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

/* User.findByIdAndUpdate(
   userId,
   { email, password: hashedPassword, name, profilePic },
   { new: true }
   )
   .then((updateduser) => res.json(updateduser))
  .catch((error) => res.json(error));
}); */

// DELETE  /api/users/:userId  -  Deletes a specific user by id
router.delete("/:userId", (req, res, next) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  User.findByIdAndRemove(userId)
    .then(() =>
      res.json({
        message: `user with ${userId} is successfully deleted.`,
      })
    )
    .catch((error) => res.json(error));
});

/*router.delete("/:userId", async (req, res, next) => {
  const { userId } = req.params;
  if (req.payload._id === userId) {
    try {
      const user = await User.findById(userId);
      try {
        //  await Post.deleteMany({ author: req.payload._id });
        await User.findByIdAndRemove(userId);
        res.status(200).json({
          message: `user with ${userId} is successfully deleted.`,
        });
      } catch (err) {
        res.status(500).json(err);
      }
    } catch (err) {
      res.status(404).json("User not found!");
    }
  } else {
    res.status(401).json("You can delete only your account!");
  }
});*/

module.exports = router;
