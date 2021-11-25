const AWS = require('aws-sdk')
const { v4: uuid } = require('uuid')
const config = require('../config')
const { alertTypesMap } = require('./data')
const ddb = new AWS.DynamoDB.DocumentClient()
const tableName = config.dynamodbTableName

async function getAllCounts () {
  const result = await ddb.query({
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': 'C'
    },
    TableName: tableName
  }).promise()

  return result.Items.map(item => formatCounts(item, item.sk.split('#').pop()))
}

async function getAlerts (areaId) {
  const result = await ddb.query({
    KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': 'A',
      ':sk': `AR#${areaId}`
    },
    TableName: tableName
  }).promise()

  return result.Items.map(formatAlert)
}

async function getAlert (areaId, code, withData = true) {
  const result = await ddb.get({
    Key: {
      pk: 'A',
      sk: `AR#${areaId}#TA#${code}`
    },
    TableName: tableName
  }).promise()

  if (!result.Item) {
    return
  }

  const alert = formatAlert(result.Item)

  if (withData) {
    const dataResult = await ddb.get({
      Key: {
        pk: 'AD',
        sk: alert.id
      },
      TableName: tableName
    }).promise()

    const alertData = dataResult.Item
    alert.headline = alertData.headline
    alert.body = alertData.body
  }

  return alert
}

async function getAreaCounts (areaId) {
  const result = await ddb.get({
    Key: {
      pk: 'C',
      sk: `AR#${areaId}`
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

function formatAlert (alert) {
  const split = alert.sk.split('#')

  return {
    id: alert.id,
    code: split[3],
    updated: alert.updated,
    areaId: split[1],
    type: alertTypesMap.get(alert.type)
  }
}

function findCount (counts, areaId) {
  return formatCounts(counts.find(item => item.areaId === areaId), areaId)
}

// async function upsertUser (userId, firstName, lastName, email) {
//   const item = {
//     pk: 'U',
//     sk: userId,
//     first_name: firstName,
//     last_name: lastName,
//     email: email,
//     last_login: Date.now()
//   }

//   const params = {
//     Item: item,
//     TableName: tableName
//   }

//   await ddb.put(params).promise()

//   return item
// }

async function issueAlert (areaId, code, type, attributes) {
  const id = uuid()
  const updated = Date.now()
  const params = {
    TransactItems: [
      {
        Put: {
          TableName: tableName,
          Item: {
            pk: 'A',
            sk: `AR#${areaId}#TA#${code}`,
            id,
            type,
            updated
          },
          ConditionExpression: 'attribute_not_exists(sk)'
        }
      },
      {
        Put: {
          TableName: tableName,
          Item: {
            pk: 'AD',
            sk: id,
            ...attributes
          },
          ConditionExpression: 'attribute_not_exists(sk)'
        }
      },
      {
        Update: {
          TableName: tableName,
          Key: {
            pk: 'C',
            sk: `AR#${areaId}`
          },
          UpdateExpression: 'ADD #counter :incr',
          ExpressionAttributeNames: {
            '#counter': type
          },
          ExpressionAttributeValues: {
            ':incr': 1
          }
        }
      }
    ]
  }

  const result = await ddb.transactWrite(params).promise()

  return result
}

module.exports = {
  getAllCounts,
  getAreaCounts,
  getAlerts,
  findCount,
  // upsertUser,
  getAlert,
  issueAlert
}
