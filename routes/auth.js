const {
  signUp,
  logIn,
  changePassword,
  forgotpassword,
  reset,
  resetpassword,
} = require("../controllers/auth");
const isAuthorized = require("../middlewares/auth");

const router = require("express").Router();
router.post("/signup", signUp);
router.post("/login", logIn);
router.post("/changepassword", isAuthorized, changePassword);
router.post("/forgotpassword", forgotpassword);
router.route("/reset/:resetToken").get(reset).post(resetpassword);
module.exports = router;
