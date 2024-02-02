const jwt = require("jsonwebtoken");
const userAuthDB = require("../models/auth");
const response = require("./response");
require("dotenv").config();

const isAuthorized = async (req, res, next) => {
  const token = req.headers.Authorization || req.headers.authorization;
  let decoded;
  if (!token) {
    return response.validationError(res, "Unauthorized");
  }
  try {
    decoded = jwt.verify(token, process.env.JWTSECRET);
    const user = await userAuthDB.findOne({ _id: decoded.id });
    if (!user) {
      return response.notFoundError(res, "No user found");
    }

    req.user = user;
    req.decoded = decoded;
    return next();
  } catch (error) {
    console.log("error", error);
    response.internalServerError(res, error.message || "Internal server error");
  }
};
module.exports = isAuthorized;
