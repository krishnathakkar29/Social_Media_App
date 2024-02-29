const express = require("express");
const { createPost, likeAndUnlikePost } = require("../controllers/post.controller");
const Post = require("../models/post.model");
const { verifyJWT } = require("../middlewares/auth");

const router = express.Router();

router.route("/post/upload").post(verifyJWT, createPost);
router.route("/post/:id").post(verifyJWT, likeAndUnlikePost)
module.exports = router;
