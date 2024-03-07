const Post = require("../models/post.model");
const User = require("../models/user.model");
const { asyncHandler } = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError  = require("../utils/ApiError")

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

exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  console.log("Post ka id is :- ", post._id);
  console.log(post);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const user = await User.findById(req.user?._id);

  //checking if correct user is there to delete
  if (post.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(401, "YOu are unauthorized to delete the post");
  }

  await post.deleteOne();

  const index = user.posts.indexOf(req.params.id);
  user.posts.splice(index, 1);
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Post is deleted Successfully"));
});

exports.getPostOfFollowing = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const posts = await Post.find({
    owner: {
      $in: user.following,
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        posts,
        "Retrieved posts of the following successfully"
      )
    );

  // const arrayOfIdOfPostsOfFollowing = user.following.map(async (follow) => {
  //   return await User.findById(follow).posts
  // })

  // const postsArray = arrayOfIdOfPostsOfFollowing.map(async (postId) => {
  //   return await Post.findById(postId)
  // })
});

exports.updateCaption = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new ApiError(404, "Post not found , incorrect id");
  }

  if (post.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      401,
      "Your are unauthorized to update other account's post"
    );
  }
  const { caption } = req.body;

  post.caption = caption;
  await post.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Caption Updated Successfully"));
});

exports.addComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new ApiError(400, "Post not found addComment controller");
  }

  let commentExists = -1;
  // let commentIndex = -1;
  post.comments.forEach((elem, index) => {
    if (elem.user.toString() == req.user._id.toString()) {
      commentExists = index;
      // commentIndex = index;
    }
  });

  if (commentExists !== -1) {
    post.comments[commentExists].comment = req.body.comment;
    await post.save();
    return res.status(200).json(new ApiResponse(200, "Comment Updated"));
  } else {
    post.comments.push({
      user: req.user._id,
      comment: req.body.comment,
    });
    await post.save();
    return res.status(200).json(new ApiResponse(200, "Comment added"));
  }
});

exports.deleteComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new ApiError(404, "Post not found (in deleteComment controller)");
  }

  if (post.owner.toString() == req.user._id.toString()) {
    if (req.body.commentId == undefined) {
      throw new ApiError(
        400,
        "id of the comment not found, commentID required"
      );
    }

    post.comments.forEach((elem, index) => {
      if (elem._id.toString() == req.body.commentId.toString()) {
        return post.comments.splice(index, 1);
      }
    });

    await post.save();

    return res
      .status(200)
      .json(new ApiResponse(200, "Selected Comment is deleted"));
  } else {
    post.comments.forEach((elem, index) => {
      if (elem.user.toString() === req.user._id.toString()) {
        post.comments.splice(index, 1);
      }
    });

    await post.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Your Comment is deleted , Comment of user deleted Successfully"
        )
      );
  }
});
