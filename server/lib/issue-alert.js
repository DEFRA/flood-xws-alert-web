const date = require('./date')
const { Alert } = require('caplib')
const { publish } = require('core/pubsub')
const { EVENTS } = require('core/events')
const { brokerUrl } = require('../config')
const { getArea, getService, getPublisher } = require('../lib/db')

/**
 * Convert an alert to cap. Currently uses the
 * `caplib` library which needs work but is ok for now.
 *  Ultimately we may opt to choose something else.
 *
 * @param {object} alert - the alert model
 */
function buildCapAlert (alert, area, service, publisher) {
  // Todo: Create valid capxml
  // Extract from this file for testing
  // https://cap-validator.appspot.com/validate

  const sender = publisher.url
  const source = service.description
  const language = 'en-GB'
  const identifier = alert.id
  const event = '062 Remove Flood Alert EA' // Todo
  const areaCode = alert.area_code
  const areaName = area.name

  const capAlert = new Alert()
  capAlert.identifier = identifier
  capAlert.sender = sender
  capAlert.sent = date().format()
  capAlert.msgType = alert.cap_msg_type
  capAlert.source = source

  // Todo: support multiple infos for Welsh?
  const capInfo = capAlert.addInfo()
  capInfo.language = language
  capInfo.headline = alert.headline
  capInfo.description = alert.body
  capInfo.event = event

  capInfo.addCategory('Geo')
  capInfo.addCategory('Met')
  capInfo.addCategory('Env')

  capInfo.urgency = alert.cap_urgency_name
  capInfo.severity = alert.cap_severity_name
  capInfo.certainty = alert.cap_certainty_name

  const capArea = capInfo.addArea(areaName)
  capArea.addGeocode('TargetAreaCode', areaCode)

  // Todo: Add polygon
  // capArea.addPolygon(...)

  return capAlert.toXml()
}

/**
 * Issue an alert
 *
 * @param {object} alert - The alert to issue
 */
async function issueAlert (alert) {
  const topic = EVENTS.alert.alert.issued
  const areaCode = alert.area_code
  const area = await getArea(areaCode)
  const service = await getService(alert.service_id)
  const publisher = await getPublisher(service.publisher_id)
  const capAlert = buildCapAlert(alert, area, service, publisher)

  return publish(brokerUrl, topic, { alert: capAlert })
}

module.exports = { issueAlert }
