const AWS = require('aws-sdk')
const { Alert } = require('caplib')
const date = require('./date')
const { getArea, getService, getPublisher } = require('../lib/db')
const { bucketName } = require('../config')

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
  capAlert.msgType = alert.cap_msg_type_name
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

  const xml = addStylesheet('./alert-style.xsl', capAlert.toXml())

  return xml
}

// Add XSL stylesheet processing instruction
function addStylesheet (href, xml) {
  const declaration = '<?xml version="1.0" encoding="utf-8"?>\n'
  const decExists = xml.includes(declaration)
  const insertIdx = decExists ? declaration.length : 0
  const instruction = `<?xml-stylesheet type="text/xsl" href="${href}"?>\n`

  return xml.substring(0, insertIdx) + instruction + xml.substring(insertIdx)
}

/**
 * Issue an alert
 *
 * @param {object} alert - The alert to issue
 */
async function issueAlert (alert) {
  const areaCode = alert.area_code
  const area = await getArea(areaCode)
  const service = await getService(alert.service_id)
  const publisher = await getPublisher(service.publisher_id)
  const capAlert = buildCapAlert(alert, area, service, publisher)

  return saveToS3(`alerts/${alert.id}.xml`, capAlert)
}

async function saveToS3 (key, body) {
  const s3bucket = new AWS.S3()

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: body,
    ContentType: 'text/xml'
  }

  const putObjectResult = await s3bucket.putObject(params).promise()

  return putObjectResult
}

module.exports = { issueAlert }
