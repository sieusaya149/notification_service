const { STATUS_NOTIFYS } = require('../../config/configurations')
const notifyModel = require('../models/notification.model')



class NotifyContent{
    constructor(destinationSocket, notifyMessage, typeNotify,
                sender, receiver, postHint = undefined, commentHint = undefined)
    {
        this.destinationSocket = destinationSocket
        this.notifyMessage = notifyMessage
        this.typeNotify = typeNotify
        this.sender = sender
        this.receiver = receiver
        this.status = 'Pending'
        // Check and assign values for postHint and commentHint
        if (postHint !== undefined) {
            this.postHint = postHint;
        }

        if (commentHint !== undefined) {
            this.commentHint = commentHint;
        }
        this.wroteToDb = false
        this.createdAt = this.updatedAt = new Date()
    }

    successWriteDownToDb(writeDownData)
    {
        this.id = writeDownData._id
        this.wroteToDb = true
    }

    setNotifyReceived()
    {
        this.status = 'Received'
    }

    setUpdatedDate()
    {
        this.updatedAt = new Date()
    }

    santilizeNotifyContent()
    {
        let clonedNotifyContent =  { ...this };
        let attrsToRemove = ['wroteToDb']
        for (const key in clonedNotifyContent) {
            if (attrsToRemove.includes(key)) {
                delete clonedNotifyContent[key]; // Remove attributes in the list
            }
        }
        return clonedNotifyContent
    }
}

class NotifyRepo {
    static instance = null
    constructor() {
        this.model = notifyModel
    }
    static getInstance()
    {
        if(!NotifyRepo.instance)
        {
            NotifyRepo.instance = new NotifyRepo()
        }
        return NotifyRepo.instance
    }

    async upSertNewNotify(notifyContent)
    {
        let TIME_RETRY = 3
        while(TIME_RETRY)
        {
            try {
                if (notifyContent.id)
                {
                    
                    const updateOptions = {
                        new: true, // Returns the updated document
                        upsert: true // Creates a new document if it doesn't exist
                    };
                    notifyContent.setUpdatedDate()
                    const updatedNotify = await notifyModel.findOneAndUpdate(
                        { _id: notifyContent.id },
                        { $set: notifyContent },
                        updateOptions
                    );
                    console.log(updatedNotify);
                    console.log("UPDATE: notify was updated successfully");
                }
                else
                {
                    
                    console.log(notifyContent.santilizeNotifyContent())
                    let newNotify = new notifyModel(notifyContent.santilizeNotifyContent())
                    const writeDownResult = await newNotify.save()
                    notifyContent.successWriteDownToDb(writeDownResult)
                    console.log("CREATE: notify was created new successfully");
                }
                return
            } catch (error) {
                console.log(`notify was upSert failed with reason ${error}`)
            }
            console.log('RETRY upload DB')
            TIME_RETRY = TIME_RETRY - 1;
        }
        
    }

    async getListNotifies(userId, status = null)
    {
        var filter = {
            "receiver.userId" : userId,
        }
        if(status){
            filter["status"] = status
        }
        const listNotify = await notifyModel.find(filter).sort({createdAt: -1})
        console.log(listNotify)

         // Initialize counters for "Pending" and "Received" notifications
        let numberPending = 0;
        let numberReceived = 0;
        let numberRead = 0;
        // Update the status of the notifications in the list
        for (const notification of listNotify) {
            if (notification.status === "Pending") {
                numberPending++;
            } else if (notification.status === "Received") {
                numberReceived++;
            }
            else 
            {
                numberRead++
            }
        }
        return {
            data: listNotify,
            numberPending,
            numberReceived,
            numberRead
        }
    }


    async allNotifyWasReceived(userId)
    {
        var filter = {
            "receiver.userId" : userId,
            "status": "Pending"
        }

        const updateDoc = {
            $set: {
                status: "Received"
            },
        };
        const listNotify = await notifyModel.updateMany(filter, updateDoc)
        console.log(listNotify)
        return listNotify
    }

    async readNotify(notifyId)
    {
        var filter = {
            "_id" : notifyId
        }

        const updateDoc = {
            $set: {
                status: "Read"
            },
        };
        const readNotify = await notifyModel.updateOne(filter, updateDoc)
        console.log(readNotify)
        return readNotify
    }
}

module.exports = {NotifyContent, NotifyRepo}