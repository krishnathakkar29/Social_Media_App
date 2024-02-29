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

  const isPasswordValid = await user.isPasswordCorrect(incomingPassword);

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
