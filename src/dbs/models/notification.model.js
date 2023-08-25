const mongoose = require ('mongoose')
// https://mongoosejs.com/docs/schematypes.html
const {NOTIFY_TYPES, STATUS_NOTIFYS} = require('../../config/configurations')
const DOCUMENT_NAME = 'Notifications';
const COLLECTION_NAME = 'Notifications';
const notificationSchema = new mongoose.Schema({
    typeNotify: 
    {
        type: String,
        enum: NOTIFY_TYPES,
        required: true
    },
    destinationSocket:
    {
      type: String,
      required: true
    },
    notifyMessage:
    {
      type: String,
      required: true
    },
    sender: 
    {
      type: Object,
      required: true
    },
    receiver:
    {
      type: Object,
      required: true
    },
    status:
    {
      type: String,
      enum: STATUS_NOTIFYS,
      default: 'Pending'
    },
    postHint:
    {
        type: Object,
        required: false
    },
    commentSummarize:
    {
        type: Object,
        required: false
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now}
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true
  });

const notifyModel = mongoose.model(DOCUMENT_NAME, notificationSchema)

module.exports = notifyModel