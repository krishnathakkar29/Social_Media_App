const User = require("../models/user.model");
const { asyncHandler } = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const options = {
  httpOnly: true,
  secure: true,
};

const generateAccessAndRefreshTokens = async (userid) => {
  try {
    const user = await User.findById(userid);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating Access and Refresh Tokens"
    );
  }
};

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if ([name, email, password].some((field) => field?.trim() == "")) {
    throw new ApiError(400, "All the fields are required");
  }

  const checkingUser = await User.findOne({ email });

  if (checkingUser) {
    throw new ApiError(409, "User with email already exists");
  }

  const user = await User.create({
    name,
    email: email?.toLowerCase(),
    password,
    avatar: {
      public_id: "sample_id",
      url: "sample url",
    },
  });

  if (!user) {
    throw new ApiError(500, "Something went wrong while regitering the user");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

exports.login = asyncHandler(async (req, res) => {
  const { email, incomingPassword } = req.body;

  if (!email) {
    throw new ApiError(400, "email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  // console.log("password valid tak pohocha ");
  console.log(user);
  console.log("Incoming Password:", incomingPassword);
  console.log("User Password:", user.password);

  const isPasswordValid = await user.isPasswordCorrect(incomingPassword);
  // console.log("password valid ke baddddddddddddd pohocha ");

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Credentials (Password is incorrect)");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

exports.logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);

  user.refreshToken = undefined;
  await user.save();

  if (user.refreshToken) {
    throw new ApiError(500, "Error while logging out");
  }

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

exports.followUser = asyncHandler(async (req, res) => {
  const userToFollow = await User.findById(req.params?.id);
  const currentLoggedInUser = await User.findById(req.user?._id);

  if (!userToFollow) {
    throw new ApiError(400, "User to follow not found");
  }

  if (currentLoggedInUser.following.includes(userToFollow._id)) {
    const indexFollowing = currentLoggedInUser.following.indexOf(
      userToFollow._id
    );
    const indexFollower = userToFollow.followers.indexOf(
      currentLoggedInUser._id
    );

    currentLoggedInUser.following.splice(indexFollowing, 1);
    userToFollow.followers.splice(indexFollower, 1);

    await userToFollow.save();
    await currentLoggedInUser.save();

    return res.status(200).json(new ApiResponse(200, "User Unfollowed"));
  } else {
    currentLoggedInUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentLoggedInUser._id);

    await userToFollow.save({ validateBeforeSave: false });
    await currentLoggedInUser.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, "User followed Successfully"));
  }
});

exports.updatePassword = asyncHandler(async (req, res) => {
  const { incomingPassword, newPassword } = req.body;

  if (!incomingPassword && !newPassword) {
    throw new ApiError(404, "Passwords in the body not found");
  }

  const user = await User.findById(req.user._id).select("+password");

  const checkPass = await user.isPasswordCorrect(incomingPassword);

  console.log(incomingPassword);
  console.log(newPassword);
  if (!checkPass) {
    throw new ApiError(400, "Incorrect incoming old password");
  }

  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated Successfully"));
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { email, name } = req.body;
  const user = await User.findById(req.user._id);
  if (email) {
    user.email = email;
  }
  if (name) {
    user.name = name;
  }

  //TODO user avatrr

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User Update Successfull"));
});

exports.deleteProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const posts = user.posts;
  const followers = user.followers;
  const following = user.following;
  const userID = user._id;

  user.refreshToken = undefined;
  await user.remove();

  //clearing cookies , logout
  res.clearCookie("accessToken", options);
  res.clearCookie("refreshToken", options);

  //removing user from followers following
  for (let i = 0; i < followers.length; i++) {
    const follower = await User.findById(followers[i]);

    const index = follower.following.indexOf(userID);
    follower.following.splice(index, 1);
    await follower.save();
  }

  //removing user from following's follower
  for (let i = 0; i < following.length; i++) {
    const follows = await User.findById(following[i]);

    const index = follows.followers.indexOf(userID);
    follows.followers.splice(index, 1);
    await follows.save();
  }
  //deleting posts
  for (let i = 0; i < posts.length; i++) {
    const post = await Post.findById(posts[i]);
    await post.remove();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Profile deleted Successfully"));
});

exports.myProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("posts")
    .select("-password -refreshToken");

  return res.status(200).json(new ApiResponse(200, user, "user details"));
});

exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate("posts");

  if (!user) {
    throw new ApiError(
      404,
      "Requested User not found in getUserProfile controller"
    );
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details fetched Successfully"));
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  const allUsers = await User.find({});

  return res.status(200).json(new ApiResponse(200, allUsers));
});
