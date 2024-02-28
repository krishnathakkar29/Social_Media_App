const express = require("express");
const { createPost } = require("../controllers/post.controller");
const Post = require("../models/post.model")

const router = express.Router()

router.route("/post/upload").post(createPost);

module.exports = router