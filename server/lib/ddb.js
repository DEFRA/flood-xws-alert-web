const AWS = require('aws-sdk')
const config = require('../config')
const ddb = new AWS.DynamoDB.DocumentClient()
const tableName = config.dynamodbTableName

async function getAllCounts () {
  const result = await ddb.query({
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': 'COUNTS'
    },
    TableName: tableName
  }).promise()

  return result.Items.map(item => formatCounts(item, item.sk.substr(5)))
}

async function getAlerts (areaId) {
  // TODO: In theory, alertSummaries could be paginated.
  // Consider other storage approaches (use StringSet/Map?) or paginate here.
  const result = await ddb.query({
    KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': `AREA#${areaId}`,
      ':sk': 'ALERT#'
    },
    TableName: tableName
  }).promise()

  return result.Items
}

async function getAreaCounts (areaId) {
  const result = await ddb.get({
    Key: {
      pk: 'COUNTS',
      sk: `AREA#${areaId}`
    },
    TableName: tableName
  }).promise()

  return formatCounts(result.Item, areaId)
}

function formatCounts (counts, areaId) {
  return !counts
    ? {
        areaId,
        fa: 0,
        fw: 0,
        sfw: 0,
        wnlif: 0
      }
    : {
        areaId,
        fa: counts.fa ?? 0,
        fw: counts.fw ?? 0,
        sfw: counts.sfw ?? 0,
        wnlif: counts.wnlif ?? 0
      }
}

function findCount (counts, areaId) {
  return formatCounts(counts.find(item => item.areaId === areaId), areaId)
}

async function upsertUser (userId, firstName, lastName, email) {
  const item = {
    pk: 'USER',
    sk: userId,
    first_name: firstName,
    last_name: lastName,
    email: email,
    last_login: Date.now()
  }

  const params = {
    Item: item,
    TableName: tableName
  }

  await ddb.put(params).promise()

  return item
}

module.exports = {
  getAllCounts,
  getAreaCounts,
  getAlerts,
  findCount,
  upsertUser
}
