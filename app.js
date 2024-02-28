const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")

const app = express()


//using middlewares
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())


const post = require("./routes/post.routes")
const user = require("./routes/user.routes")
//using routes
app.use("/api/v1",post)
app.use("/api/v1",user)


require("dotenv").config({path: "backend/.env"})
module.exports = app