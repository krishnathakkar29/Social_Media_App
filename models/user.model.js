const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter a name"],
  },

  avatar: {
    public_id: String,
    url: String,
  },

  email: {
    type: String,
    required: [true, "Please enter an email"],
    unique: true,
  },

  password: {
    type: String,
    required: [true, "Please enter a password"],
    // select: false,
    minLength: [6, "Password must be of atleast 6 characters"],
  },
  refreshToken: {
    type: String,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],

  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  resetPasswordToken: String,
  resetPasswordTokenExpiry: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  //jwt.sign generates token , READ JWT GITHUB
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.getResetPasswordToken = function () {
  const resetTokenGenerate = crypto.randomBytes(20).toString("hex");
  console.log(resetTokenGenerate);

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetTokenGenerate)
    .digest("hex");

  this.resetPasswordTokenExpiry = Date.now() + 10 * 60 * 1000; //valid for 10minutres

  return resetTokenGenerate
};

module.exports = mongoose.model("User", userSchema);
