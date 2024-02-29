const express = require("express");
const {
  createPost,
  likeAndUnlikePost,
  deletePost,
} = require("../controllers/post.controller");
const Post = require("../models/post.model");
const { verifyJWT } = require("../middlewares/auth");

const router = express.Router();

router.route("/post/upload").post(verifyJWT, createPost);
router.route("/post/:id").get(verifyJWT, likeAndUnlikePost).delete(verifyJWT, deletePost);
module.exports = router;
