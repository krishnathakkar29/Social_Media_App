const express = require("express")
const { register, login, followUser } = require("../controllers/user.controller")
const { verifyJWT } = require("../middlewares/auth");
const router = express.Router()

router.route("/register").post(register)
router.route("/login").post(login)
router.route("/follow/:id").get(verifyJWT, followUser
    )

module.exports = router