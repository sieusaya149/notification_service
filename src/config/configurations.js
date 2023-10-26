const ConfigLoader = require("../../configurationRepo/src/configLoader")

const STATUS_NOTIFYS = ['Pending', 'Received', 'Read']

// loading configuration 
const sharingConfig = ConfigLoader.getInstance()
const NOTIFICATION_CONFIG = sharingConfig.getConfig()?.notifications

module.exports = {STATUS_NOTIFYS, NOTIFICATION_CONFIG}