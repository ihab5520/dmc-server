const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    registrationDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = model("User", userSchema);