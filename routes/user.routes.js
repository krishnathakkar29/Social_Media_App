const express = require("express");
const {
  register,
  login,
  followUser,
  logoutUser,
  updatePassword,
  updateProfile,
  deleteProfile,
  myProfile,
  getUserProfile,
  getAllUsers,
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
router.route("/delete/me").delete(verifyJWT, deleteProfile);
router.route("/myProfile").get(verifyJWT, myProfile);
router.route("/user/:id").get(verifyJWT, getUserProfile);
router.route("/allUsers").get(verifyJWT, getAllUsers);
module.exports = router;
