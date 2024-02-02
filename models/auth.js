const mongoose = require("mongoose");
const validator = require("validator");

const userAuthSchema = mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Please enter your name"],
      unique: true,
      maxLength: [30, "Name cannot exceed 30 charecter"],
      minLength: [2, "Name should have more than 2 charecter"],
    },
    email: {
      type: String,
      required: [true, "please enter your email"],
      unique: true,
      validate: [validator.isEmail, "please enter valid email"],
    },
    password: {
      type: String,
      required: [true, "please enter your password"],
      minLength: [6, "password should be greater than 6 charecter"],
    },
  },
  { timestamps: true }
);
const userAuthModel = mongoose.model("UserAuth", userAuthSchema);

module.exports = userAuthModel;
