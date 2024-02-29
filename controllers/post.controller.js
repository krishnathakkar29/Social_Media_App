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

  return res
    .status(201)
    .json(new ApiResponse(200, { post }, "New Post Created Successfully"));
});

exports.likeAndUnlikePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }


  if (post.likes.includes(req.user._id)) {
    const index = post.likes.indexOf(req.user?._id);
    post.likes.splice(index, 1);
    await post.save();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "post unliked by user"));
    // const index = post.likes.map((item,index) => {
    //   if(item == req.user.id) return index
    // })
  } else {
    post.likes.push(req.user?._id);
    await post.save();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Post is liked by user successfully"));
  }
});
