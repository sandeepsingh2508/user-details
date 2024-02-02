const userDB = require("../models/user");
const userAuthDB = require("../models/auth");
const response = require("../middlewares/response");
const createUserDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, phone, address, comments } = req.body;
    if (!name || !phone || !address) {
      return response.validationError(
        res,
        "Cannot create an user details without proper information"
      );
    }
    const findUser = await userAuthDB.findById({ _id: userId });
    if (!findUser) {
      return response.notFoundError(res, "Cannot find this user");
    }
    const newDetails = await new userDB({
      userId: userId,
      name: name,
      phone: phone,
      address: address,
      comments: comments,
    }).save();

    if (!newDetails) {
      return response.internalServerError(
        res,
        "Cannot create the user Details"
      );
    }
    response.successResponse(
      res,
      newDetails,
      "Successfully create the user details"
    );
  } catch (error) {
    response.internalServerError(res, error.message || "Internal server error");
  }
};

const updateUserDetails = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id || id === ":id") {
      return response.validationError(
        res,
        "Cannot update user details without a userId"
      );
    }
    const { name, phone, address, comments } = req.body;
    const findUser = await userDB.findById({ _id: id });
    if (!findUser) {
      return response.notFoundError(res, "Cannot find user");
    }
    const updatedData = {
      ...(name && { name: name }),
      ...(phone && { phone: phone }),
      ...(comments && { comments: comments }),
      ...(address && { address: address }),
    };
    const updatedUser = await userDB.findByIdAndUpdate(
      { _id: id },
      updatedData,
      { new: true }
    );
    if (!updatedUser) {
      return response.internalServerError(res, "Cannot update the user");
    }
    response.successResponse(res, updatedUser, "Successfully updated the user");
  } catch (error) {
    response.internalServerError(res, error.message || "Internal server error");
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id || id === ":userId") {
      return response.validationError(
        res,
        "Cannot delete user details without a userId"
      );
    }
    const findUser = await userDB.findById({ _id: id });
    if (!findUser) {
      return response.notFoundError(res, "Cannot find user");
    }
    const deletedUser = await userDB.findByIdAndDelete({ _id: id });
    if (!deletedUser) {
      return response.internalServerError(res, "Cannot delete the user");
    }
    response.successResponse(
      res,
      deletedUser,
      "Successfully deleted the user details"
    );
  } catch (error) {
    response.internalServerError(res, error.message || "Internal server error");
  }
};

const getSingleUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id || id === ":userId") {
      return response.validationError(
        res,
        "Cannot get user details without a userId"
      );
    }
    const findUser = await userDB.findById({ _id: id });
    if (!findUser) {
      return response.notFoundError(res, "Cannot find user");
    }

    if (!findUser) {
      return response.internalServerError(res, "Cannot find the user");
    }
    response.successResponse(
      res,
      findUser,
      "Successfully find the user details"
    );
  } catch (error) {
    response.internalServerError(res, error.message || "Internal server error");
  }
};

const getAllUsers = async (req, res) => {
  try {
    const userId = req.decoded.id;
    const allUsers = await userDB.find({ userId: userId });
    if (!allUsers) {
      return response.internalServerError(res, "User not found");
    }
    response.successResponse(res, allUsers || "Successfully found all users");
  } catch (error) {
    response.internalServerError(res, error.message || "Internal server error");
  }
};
module.exports = {
  createUserDetails,
  updateUserDetails,
  getSingleUser,
  getAllUsers,
  deleteUser,
};
