const express = require ('express')
const http = require('http');
const cors = require('cors');
const WebSocketServer = require("./services/sockets.services")
const MongoDbManager = require("./dbs/init.mongodb")
const RabbitMq = require("./services/rabbitMq.services")
const {NotifyRepo} = require('./dbs/repositories/notification.repo')
const {NOTIFICATION_CONFIG} = require("./config/configurations")
require('dotenv').config()

const app = express()
const server = http.createServer(app);
app.use(express.json());
webSocket = WebSocketServer.getInstance(server)

// Use the cors middleware
app.use(cors());
// init db
const mongoDbInstance = MongoDbManager.getInstance()


RabbitMq.getInstance(NOTIFICATION_CONFIG?.EXCHANGES?.notify, NOTIFICATION_CONFIG?.NOTIFY_QUEUES?.notify, [])

app.get('/notifies/:userId', async (req, res, next) => {
    const status = req.query.status
    const userId = req.params.userId
    const repo = NotifyRepo.getInstance()
    console.log(userId)
    const data = await repo.getListNotifies(userId, status)
    res.status(200).json({data: data})
})

app.put('/receivedApi/:userId', async (req, res, next) => {
    const repo = NotifyRepo.getInstance()
    const userId = req.params.userId
    const data = await repo.allNotifyWasReceived(userId)
    res.status(200).json({data: data})
})

app.put('/readNotify/:notifyId', async (req, res, next) => {
    const repo = NotifyRepo.getInstance()
    const notifyId = req.params.notifyId
    const data = await repo.readNotify(notifyId)
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
