const mongoose = require("mongoose")

exports.connnectDB = async () => {
    mongoose.connect(`${process.env.MONGODB_CONNECTION_STRING}/${process.env.MONGODB_DATABASE_NAME}`)
    .then((con) => {
        console.log(`Database connected: ${con.connection.host}`)
    })
    .catch((err) => {
        console.log("ERROR in connecting DB", err)
    })
}