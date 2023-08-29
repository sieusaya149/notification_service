const NOTIFY_TYPES = ['friendRequest', "acceptedRequest"]

const STATUS_NOTIFYS = ['Pending', 'Received', 'Read']

const NOTIFY_TYPES_OBJ = {
    friendRequest: "friendRequest",
    acceptedRequest: "acceptedRequest"
}

const LIST_EXCHANGE = {
    notify: "notify_blog_exchange"
}

const NOTIFY_QUEUE = {
    notify: "notify_blog_queue"
}

module.exports = {NOTIFY_TYPES, NOTIFY_TYPES_OBJ, STATUS_NOTIFYS, LIST_EXCHANGE, NOTIFY_QUEUE}