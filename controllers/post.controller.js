const Post = require("../models/post.model");
const User = require("../models/user.model");
const { asyncHandler } = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

exports.createPost = asyncHandler(async (req, res, next) => {
  const newPostData = {
    caption: req.body?.caption,
    image: {
      public_id: "req.body.public_id",
      url: "req.body.url",
    },
    owner: req.user?._id,
  };

  const post = await Post.create(newPostData);
  const user = await User.findById(req.user?._id);

  user.posts.push(post?._id);
  await user.save({ validateBeforeSave: false });

  return res.status(201).json(new ApiResponse(200, { post }, "New Post Created Successfully"));
});
