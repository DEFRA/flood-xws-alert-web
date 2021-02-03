const { publish } = require('core/pubsub')
const EVENTS = require('core/events.json')
const { brokerUrl } = require('../config')

/**
 * Issue an alert
 *
 * @param {object} alert - The alert to issue
 */
async function issueAlert (alert) {
  const topic = EVENTS.alert.issued

  return publish(brokerUrl, topic, alert)
}

module.exports = {
  issueAlert
}
