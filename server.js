const server = require("./src/app")
require('dotenv').config()
PORT = process.env.PORT || 3055
server.listen (PORT, () => {
    console.log(`Server Notification start with ${PORT}`)
})