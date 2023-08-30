const express = require ('express')
const http = require('http');
const cors = require('cors');
const WebSocketServer = require("./services/sockets.services")
const MongoDbManager = require("./dbs/init.mongodb")
const RabbitMq = require("./services/rabbitMq.services")
const {LIST_EXCHANGE, NOTIFY_QUEUE} = require("./config/configurations") 
const {NotifyRepo} = require('./dbs/repositories/notification.repo')

require('dotenv').config()

const app = express()
const server = http.createServer(app);
app.use(express.json());
webSocket = WebSocketServer.getInstance(server)

// Use the cors middleware
app.use(cors());
// init db
const mongoDbInstance = MongoDbManager.getInstance()

// init rabbit mq for testing
const rabbitMqInstance = RabbitMq.getInstance(LIST_EXCHANGE.notify, NOTIFY_QUEUE.notify, [])

app.get('/notifies/:userId', async (req, res, next) => {
    const status = req.query.status
    const userId = req.params.userId
    const repo = NotifyRepo.getInstance()
    console.log(userId)
    const data = await repo.getListNotifies(userId, status)
    res.status(200).json({data: data})
})

process.on('SIGINT', () => {
    mongoDbInstance.disconnect()
    .then(() => {
        console.log('exit now')
        process.exit(0)  
    })    
});


module.exports  = server
