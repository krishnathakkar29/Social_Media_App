const app = require('./app')
const { connnectDB } = require('./db/database')


connnectDB()
.then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`App is running on port ${process.env.PORT}`)
    })
})
.catch(err => {
    console.log("MONGODB CONNECTION FAILED IN SERVER: ", err)
})