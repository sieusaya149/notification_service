const mongoose = require ('mongoose')

const uriConnection = `mongodb://localhost:27017/`
let options = {
    maxPoolSize: 50
}

// I think beside with create a new connection with mongo db, we should keep this connection till the application close
// then I choose sigleton pattern for keeping the database connection or the database instance

class MongoDbManager{
    static instance
    constructor(uriString, options)
    {
        this.connector = null
        this.connect(uriString, options)
    }

    static getInstance()
    {
        if(!MongoDbManager.instance)
        {
            MongoDbManager.instance = new MongoDbManager(uriConnection, options)
        }
        return MongoDbManager.instance;
    }

    async connect(uriString, options)
    {
        mongoose.connect(uriConnection, options)
        .then(con => {
            this.connector = con
            console.log('Successful connecting to mongodb')
        })
        .catch(err => console.log(`${err}`))
    }

    async disconnect()
    {
        return mongoose.disconnect()
    }

}

module.exports = MongoDbManager