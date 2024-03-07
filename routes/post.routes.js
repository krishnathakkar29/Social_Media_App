const express = require("express");
const {
  createPost,
  likeAndUnlikePost,
  deletePost,
  getPostOfFollowing,
  updateCaption,
  addComment,
  deleteComment,
} = require("../controllers/post.controller");
const Post = require("../models/post.model");
const { verifyJWT } = require("../middlewares/auth");

const router = express.Router();

router.route("/post/upload").post(verifyJWT, createPost);
router
  .route("/post/:id")
  .get(verifyJWT, likeAndUnlikePost)
  .put(verifyJWT, updateCaption)
  .delete(verifyJWT, deletePost);

router.route("/getFollowing").get(verifyJWT, getPostOfFollowing);
router
  .route("/post/comment/:id")
  .put(verifyJWT, addComment)
  .delete(verifyJWT, deleteComment);
module.exports = router;
