const User = require("../models/user.model")
const { asyncHandler } = require("../utils/asyncHandler")
const ApiError = require("../utils/ApiError")
const ApiResponse = require("../utils/ApiResponse")

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

exports.register = asyncHandler(async (req,res) => {
    const {name, email, password} = req.body

    if([name, email, password].some(field => field?.trim() == "")
    ){
        throw new ApiError(400, "All the fields are required");
    }

    const checkingUser = await User.findOne({ email })

    if(checkingUser){
        throw new ApiError(409, "User with email already exists");
    }

    const user = await User.create({
        name,
        email: email?.toLowerCase(),
        password,
        avatar:{
            public_id: "sample_id",
            url: "sample url"
        }
    })

    if (!user) {
        throw new ApiError(500, "Something went wrong while regitering the user");
      }

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            user, 
            "User registered Successfully"
        )
    )

})

exports.login = asyncHandler(async (req,res) => {
    const {email, incomingPassword} = req.body;

    if(!email){
        throw new ApiError(400, "email is required");
    }

    const user = await User.findOne({email})

    if(!user){
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(incomingPassword)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid User Credentials (Password is incorrect)");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
      );

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


    return res
        .status(200)
        .cookie("accessToken", accessToken, options )
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        )


})