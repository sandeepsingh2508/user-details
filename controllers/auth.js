const userAuthDB = require("../models/auth");
const tokenDB = require("../models/token");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const response = require("../middlewares/response");
const sendMail = require("../utils/sendmail");
const Handlebars = require("handlebars");
const path = require("path");
const fs = require("fs");
const jwt = require("../utils/jwt");

const signUp = async (req, res) => {
  const { userName, email, password } = req.body;
  try {
    if (!userName || !email || !password) {
      return response.validationError(
        res,
        "Cannot create an account without proper information"
      );
    }
    const findUser = await userAuthDB.findOne({ email: email.toLowerCase() });

    if (findUser) {
      return response.errorResponse(
        res,
        "User Already exists.please login",
        400
      );
    }
    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await new userAuthDB({
      userName: userName,
      password: hashPassword,
      email: email.toLowerCase(),
    }).save();

    const token = jwt(newUser._id);
    const result = {
      user: newUser,
      token: token,
    };
    response.successResponse(res, result, "Successfully saved the user");
  } catch (error) {
    console.error(error);
    response.internalServerError(res, error.message || "Internal server error");
  }
};

const logIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return response.validationError(
        res,
        "Cannot login without proper information"
      );
    }
    const findUser = await userAuthDB.findOne({ email: email.toLowerCase() });
    if (!findUser) {
      response.notFoundError(res, "Cannot find the user");
    }
    const comparePassword = await bcrypt.compare(password, findUser.password);
    if (comparePassword) {
      const token = jwt(findUser._id);
      const result = {
        user: findUser,
        token: token,
      };
      response.successResponse(res, result, "Login successful");
    } else {
      response.errorResponse(res, "Password incorrect", 400);
    }
  } catch (error) {
    console.log(error);
    response.internalServerError(res, error.message || "Internal server error");
  }
};

const changePassword = async (req, res) => {
  try {
   const userId=req.user._id
    try {
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return response.validationError(
          res,
          "Cannot change password without proper information"
        );
      }
      const findUser = await userAuthDB.findById({ _id: userId });
      if (!findUser) return response.notFoundError(res, "Cannot find the user");
      const comparePassword = await bcrypt.compare(
        oldPassword,
        findUser.password
      );
      if (!comparePassword) {
        return response.errorResponse(res, "Incorrect old password", 400);
      }
      const hashedPassword = await bcrypt.hash(
        newPassword,
        await bcrypt.genSalt(10)
      );
      findUser.password = hashedPassword;
      const updatedUser = await findUser.save();
      if (!updatedUser) {
        return response.internalServerError(res, "Failed to update the user");
      }
      response.successResponse(
        res,
        updatedUser,
        "Successfully updated the password"
      );
    } catch (error) {
      response.internalServerError(res, "Error occured");
    }
  } catch (error) {
    response.internalServerError(res, error.message || "Internal server error");
  }
};

const forgotpassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return response.validationError(res, "Please fill in the field");
    }
    const user = await userAuthDB.findOne({ email: email.toLowerCase() });
    if (!user) {
      return response.notFoundError(res, "User not found");
    } else {
      const tokenExists = await tokenDB.findOne({ userId: user._id });
      if (tokenExists) {
        await tokenDB.deleteOne({ userId: user._id });
      }
      const resetToken = crypto.randomBytes(32).toString("hex") + user._id;
      console.log("resetToken", resetToken);
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      const savedToken = await new tokenDB({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * (60 * 1000),
      }).save();
      const resetUrl = `${process.env.BACKEND_URL}/api/userauth/reset/${resetToken}`;
      const __dirname = path.resolve();
      const templatePath = path.join(
        __dirname,
        "template",
        "forgot-password.html"
      );
      const source = fs.readFileSync(templatePath, { encoding: "utf-8" });
      const template = Handlebars.compile(source);
      const html = template({
        USERNAME: user.name,
        RESETURL: resetUrl,
      });
      const mailOptions = {
        from: `"no-reply" ${process.env.EMAIL}`,
        to: user.email,
        subject: "Password change request",
        html,
      };
      try {
        await sendMail(mailOptions);
        response.successResponse(res, "", "A reset email has been sent");
      } catch {
        response.internalServerError(res, "Not able to send the mail");
      }
    }
  } catch (error) {
    response.internalServerError(res, error.message || "Internal server error");
  }
};

const reset = async (req, res) => {
  const { resetToken } = req.params;
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const verifyToken = await tokenDB.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() },
    });
    const __dirname = path.resolve();
    if (!verifyToken) {
      const templatePath = path.join(__dirname, "template", "error.html");
      const source = fs.readFileSync(templatePath, { encoding: "utf-8" });
      const template = Handlebars.compile(source);
      const html = template({
        TITLE: "Password reset token is invalid or has expired.",
        MESSAGE: "Please reset your password once again.",
      });
      return res.send(html);
    }
    res.sendFile(path.resolve(__dirname, "template", "reset-password.html"));
  } catch (error) {
    console.log(error);
    response.internalServerError(res, error.message || "Internal server error");
  }
};

const resetpassword = async (req, res) => {
  const { resetToken } = req.params;
  try {
    const { password } = req.body;
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const verifyToken = await tokenDB.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() },
    });
    const __dirname = path.resolve();
    if (!verifyToken) {
      const templatePath = path.join(__dirname, "template", "error.html");
      const source = fs.readFileSync(templatePath, { encoding: "utf-8" });
      const template = Handlebars.compile(source);
      const html = template({
        TITLE: "Password reset token is invalid or has expired.",
        MESSAGE: "Please reset your password once again.",
      });
      return res.send(html);
    }
    const user = await userAuthDB.findOne({ _id: verifyToken.userId });
    await tokenDB.findByIdAndDelete(verifyToken._id);
    user.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
    await user.save();
    let templatePath = path.join(
      __dirname,
      "template",
      "password-change-confirmation.html"
    );
    let source = fs.readFileSync(templatePath, { encoding: "utf-8" });
    let template = Handlebars.compile(source);
    let html = template({
      NAME: user.name,
      EMAIL: user.email,
    });
    const mailOptions = {
      from: `"no-reply" ${process.env.EMAIL}`,
      to: user.email,
      subject: "Your password has been changed",
      html,
    };
    await sendMail(mailOptions);
    templatePath = path.join(__dirname, "template", "success.html");
    source = fs.readFileSync(templatePath, { encoding: "utf-8" });
    template = Handlebars.compile(source);
    html = template({
      TITLE: "Your Password has been Updated!",
      MESSAGE: "Now, You are able to Login.",
    });
    res.send(html);
  } catch (error) {
    response.internalServerError(res, error.message || "Internal server error");
  }
};


module.exports = {
  signUp,
  logIn,
  changePassword,
  forgotpassword,
  reset,
  resetpassword,
};
