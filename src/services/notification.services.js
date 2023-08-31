const { NOTIFICATION_CONFIG } = require("../config/configurations")
const {NotifyContent, NotifyRepo} = require('../dbs/repositories/notification.repo')

class NotificationAbstract {
    constructor(notifyData, listSocket) {
        this.notifyData = notifyData
        this.notifyList = []
        this.listSocket = listSocket
        this.instanceNotiRepo = NotifyRepo.getInstance()
    }

    async upsertNotifyData(notifyContent)
    {
        await this.instanceNotiRepo.upSertNewNotify(notifyContent)
    }
    prepareNotifyMessageContent() {
        console.log('Should Implementation prepareNotifyMessageContent')
    }

    async writeNotifyToDb() {
        for( let i = 0; i < this.notifyList.length; i++)
        {
            await this.upsertNotifyData(this.notifyList[i])
        }
    }

    async executeNotifying() {
        console.log('Should Implementation writeNotifyToDb')
    }

    emitNotify2Client()
    {
        for( let i = 0; i < this.notifyList.length; i++)
        {
            console.log(`should send notify to socket ${this.notifyList[i].destinationSocket}`)
            const notifyContent = this.notifyList[i]
            const destinationSocket = notifyContent.destinationSocket
            if(!notifyContent.wroteToDb)
            {
                console.log('WARING: this notify does not write down succesfully to DB yet')
                break;
            }
            if(!this.listSocket[destinationSocket])
            {
                console.log(`User ${notifyContent.sender.userName} is offline now`)                
            }
            else
            {
                
                this.listSocket[destinationSocket].emit(notifyContent.metaData.typeNotify, notifyContent, (ack) => 
                {
                    if (ack == 'received')
                    {
                        //update status notify 
                        notifyContent.setNotifyReceived()
                        this.upsertNotifyData(notifyContent)
                    }

                })
            }
        }
    }
}

class NotifactionFollowRequest extends NotificationAbstract {
    constructor(notifyData, listSocket) {
        super(notifyData, listSocket)
    }

    prepareNotifyMessageContent() {
        const sender = this.notifyData.from
        const receiver = this.notifyData.to
        if (!sender || !receiver) {
            console.log('Can not create notify message')
            return
        }
        const messageNotify =  sender.userName + " want to follow you"
        this.notifyList.push(new NotifyContent(receiver.userId, messageNotify, this.notifyData.typeNotify, sender, receiver))
    }

    async executeNotifying() {
        // 1. preparemessage
        console.log('executeNotifying for request following')
        this.prepareNotifyMessageContent()
        // 2. write to DB
        await this.writeNotifyToDb()
        // 3. send to client + update db if neccessary
        this.emitNotify2Client()
    }

    printDebug()
    {
        console.log(`DEBUG: nums notify will be send to client is ${this.notifyList.length}`)
        console.log("-----------------------------------------")
        this.notifyList.forEach(element => {
            console.log(element)
        });
        console.log("-----------------------------------------")
    }
}

class NotifactionAcceptFollowing extends NotificationAbstract {
    constructor(notifyData, listSocket) {
        super(notifyData, listSocket)
    }
    prepareNotifyMessageContent() {
        const sender = this.notifyData.from
        const receiver = this.notifyData.to
        if (!sender || !receiver) {
            console.log('Can not create notify message')
            return
        }
        this.prepareNotifyForAcceptor(sender, receiver)
        this.prepareNotifyForRequestor(sender, receiver)
    }

    prepareNotifyForAcceptor(sender, receiver){
        const messageNotify =  `you and ${receiver.userName} are the friends now`
        // the sender will received the notify
        this.notifyList.push(new NotifyContent(sender.userId, messageNotify, this.notifyData.typeNotify, sender, sender))
    }
    prepareNotifyForRequestor(sender, receiver){
        const messageNotify =  `${sender.userName} has accepted your following request`
        this.notifyList.push(new NotifyContent(receiver.userId, messageNotify, this.notifyData.typeNotify, sender, receiver))
    }

    async executeNotifying() {
         // 1. preparemessage
         console.log('executeNotifying for accept following')
         this.prepareNotifyMessageContent()
         // 2. write to DB
         await this.writeNotifyToDb()
         // 3. send to client + update db if neccessary
         this.emitNotify2Client()
    }

    printDebug()
    {
        console.log(`DEBUG: nums notify will be send to client is ${this.notifyList.length}`)
        console.log("-----------------------------------------")
        this.notifyList.forEach(element => {
            console.log(element)
        });
        console.log("-----------------------------------------")
    }
}

class NotificationFactory {
    constructor() {

    }
    selectNotificationType(notificationData, listSocket) {
        if (notificationData.typeNotify == NOTIFICATION_CONFIG?.TYPES?.friendRequest) {
            return new FollowRequestNotifyCreator(notificationData, listSocket).createNotification()
        }
        else if (notificationData.typeNotify == NOTIFICATION_CONFIG?.TYPES?.acceptedRequest) {
            return new AcceptFollowingNotifyCreator(notificationData, listSocket).createNotification()
        }
        else {
            return null
        }
    }
    // do function()
}

class FollowRequestNotifyCreator {
    constructor(notifyData, listSocket) {
        this.notifyData = notifyData
        this.listSocket = listSocket
    }
    createNotification() {
        return new NotifactionFollowRequest(this.notifyData, this.listSocket)
    }
}

class AcceptFollowingNotifyCreator {
    constructor(notifyData, listSocket) {
        this.notifyData = notifyData
        this.listSocket = listSocket
    }
    createNotification() {
        return new NotifactionAcceptFollowing(this.notifyData, this.listSocket)
    }
}


module.exports = new NotificationFactory()