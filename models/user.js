const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      maxLength: [30, "Name cannot exceed 30 charecter"],
      minLength: [2, "Name should have more than 2 charecter"],
    },
    phone: {
      type: String,
      validate: {
        validator: function (value) {
          return value.length === 10;
        },
        message: "Phone number must be 10 digits long",
      },
    },
    address: {
      type: String,
      maxLength: [150, "Address cannot exceed 150 charecter"],
      minLength: [4, "Address should have more than 4 charecter"],
    },
    comments: {
      type: String,
      maxLength: [150, "Address cannot exceed 150 charecter"],
      minLength: [4, "Address should have more than 4 charecter"],
    },
  },
  { timestamps: true }
);
const userModel = mongoose.model("UserDetail", userSchema);

module.exports = userModel;
