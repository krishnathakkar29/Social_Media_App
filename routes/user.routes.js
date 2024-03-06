const express = require("express");
const {
  register,
  login,
  followUser,
  logoutUser,
  updatePassword,
  updateProfile,
} = require("../controllers/user.controller");
const { verifyJWT } = require("../middlewares/auth");
// const { verify } = require("jsonwebtoken");
const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);

//controlled routes
router.route("/logout").get(verifyJWT, logoutUser);
router.route("/follow/:id").get(verifyJWT, followUser);
router.route("/update/password").put(verifyJWT, updatePassword);
router.route("/update/profile").put(verifyJWT, updateProfile);

module.exports = router;
