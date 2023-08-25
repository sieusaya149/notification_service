// This file will consume the message from queue
const amqp = require('amqplib');
const NotificationFactory  = require('./notification.services');
require('dotenv').config()
const rabbitmqConnectStr = process.env.RABBIT_CONNECTION_URL
const exchangeType = 'direct'
const exchangeOptions = { durable : false}
const queueOptions = {exclusive: true}
class RabbitMq {
    static instance = null
    constructor() {
        this.connection = null
        this.channel = null
        this.exchange = null
        this.queue = null
    }
    
    static async getInstance(exchangeName, queueName, listsocket)
    {
        try {
            if(RabbitMq.instance == null)
            {
                RabbitMq.instance = new RabbitMq()
                await RabbitMq.instance.connect(rabbitmqConnectStr)
            }
            await RabbitMq.instance.createExchange(exchangeName, exchangeType, exchangeOptions)
            await RabbitMq.instance.createQueue(exchangeName, queueName)
            await RabbitMq.instance.consumeNotify()
            RabbitMq.instance.listSocket = listsocket
            return RabbitMq.instance
        } catch (error) {
            console.log("Preparing Connecting to Rabbit MQ failed with reason ", error)
            return null
        }
       
    }

    async connect(connectStr)
    {
          this.connection = await amqp.connect(connectStr);
          this.channel = await this.connection.createChannel()
    }

    async createExchange(exchangeName, exchangeType, exchangeOptions)
    {
        this.exchange = await this.channel.assertExchange(exchangeName, exchangeType, exchangeOptions)
 
    }

    async createQueue(exchangeName, queueName)
    {
        this.queue = await this.channel.assertQueue(queueName, queueOptions);
        console.log(`Waiting for messages in queue: ${this.queue.queue}`);
        this.channel.bindQueue(this.queue.queue, exchangeName, queueName)
    }

    async consumeNotify()
    {
        this.channel.consume(this.queue.queue, msg => {
            if(msg.content) 
            {
                const notifyObject = JSON.parse(msg.content)
                console.log(`Routing Key: ${msg.fields.routingKey}, Notify: ${notifyObject}`);
                console.log(notifyObject)
                // if(notifyObject.type == "FollowRequest")
                // {
                //     var notifyMsg = notifyObject.from + "want add friend with you"
                //     if(this.listSocket[notifyObject.to])
                //     {
                //         console.log("Emit to FE")
                //         this.listSocket[notifyObject.to].emit('FollowRequest', notifyMsg)
                //     }
                // }
                const notify = NotificationFactory.selectNotificationType(notifyObject, this.listSocket)
                if(!notify)
                {
                    console.log("No idea for create new notify for user")
                    return 
                }
                notify.executeNotifying()
            }
            
        }, {noAck: true})
    }
}
module.exports = RabbitMq