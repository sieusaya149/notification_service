const express = require ('express')
const http = require('http');
const WebSocketServer = require("./services/sockets.services")
const MongoDbManager = require("./dbs/init.mongodb")
const RabbitMq = require("./services/rabbitMq.services")
require('dotenv').config()

const app = express()
const server = http.createServer(app);
app.use(express.json());
webSocket = WebSocketServer.getInstance(server)

// init db
const mongoDbInstance = MongoDbManager.getInstance()

// init rabbit mq for testing
const rabbitMqInstance = RabbitMq.getInstance('notify', "VIETHUNG", [])


process.on('SIGINT', () => {
    mongoDbInstance.disconnect()
    .then(() => {
        console.log('exit now')
        process.exit(0)  
    })    
});


module.exports  = server
