const express = require("express");
const { createPost } = require("../controllers/post.controller");
const Post = require("../models/post.model")
const {verifyJWT} = require("../middlewares/auth")

const router = express.Router()

router.route("/post/upload").post(verifyJWT, createPost);

module.exports = router