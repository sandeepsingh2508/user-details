const {
  createUserDetails,
  updateUserDetails,
  getSingleUser,
  getAllUsers,
  deleteUser,
} = require("../controllers/user");
const isAuthorized = require("../middlewares/auth");

const router = require("express").Router();
router.post("/create", isAuthorized, createUserDetails);
router.put("/update/:id", isAuthorized, updateUserDetails);
router.get("/singleuser/:id", isAuthorized, getSingleUser);
router.get("/getall", isAuthorized, getAllUsers);
router.delete("/delete/:id", isAuthorized, deleteUser);

module.exports = router;
