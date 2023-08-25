const socketIo = require('socket.io');
const RabbitMq = require("./rabbitMq.services")

class WebSocketServer {
    static instance = null
    constructor(server){
        console.log("Create new socket server")
        this.io = socketIo(server);
        this.connections = {}
        this.messageQueue = null
    }

    static getInstance(server)
    {
        if (WebSocketServer.instance == null)
        {
            WebSocketServer.instance = new WebSocketServer(server)
        }
        WebSocketServer.instance.onConnecting()
        return WebSocketServer.instance
    }

    onConnecting()
    {
        this.io.on('connection', (socket) => {
            const userId = socket.handshake.query.userId; // You would set this when connecting from the client
            // const userId = "VIETHUNG"
            this.connections[userId] = socket;
            console.log('the new connection to the server ', userId)
            this.messageQueue = RabbitMq.getInstance("notify", userId, this.connections)
            socket.on('disconnect', () => {
                delete this.connections[userId];
            });
        });
    }

    notifyFollowRequest(message, fromUsr, toUsr)
    {
        if(this.connections[toUsr])
        {
            this.connections[toUsr].emit('requestFollow', { fromUsr });
        }
    }

    notifyAcceptFollow(message, fromUsr, toUsr)
    {
        if(this.connections[toUsr])
        {
            this.connections[toUsr].emit('acceptFollow', { fromUsr });
        }
    }
}

module.exports = WebSocketServer