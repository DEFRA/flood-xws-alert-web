const AWS = require('aws-sdk')
const { v4: uuid } = require('uuid')
const config = require('../config')
const { alertTypesMap, areasMap, regionsMap } = require('common/data')
const ddb = new AWS.DynamoDB.DocumentClient()
const tableName = config.dynamodbTableName

async function getAllAlerts () {
  const result = await ddb.query({
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': 'A'
    },
    TableName: tableName
  }).promise()

  return result.Items.map(formatAlert)
}

async function getAlerts (areaId) {
  const result = await ddb.query({
    KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': 'A',
      ':sk': `AR#${areaId}#`
    },
    TableName: tableName
  }).promise()

  return result.Items.map(formatAlert)
}

async function getAlert (areaId, code, includeData = true) {
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

  if (includeData) {
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

function formatAlert (alert) {
  const split = alert.sk.split('#')
  const areaId = split[1]
  const area = areasMap.get(areaId)
  const regionId = area.regionId
  const region = regionsMap.get(regionId)

  return {
    id: alert.id,
    code: split[3],
    updated: alert.updated,
    area,
    region,
    type: alertTypesMap.get(alert.type)
  }
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
            pk: 'AD',
            sk: id,
            areaId,
            code,
            updated,
            ...attributes
          },
          ConditionExpression: 'attribute_not_exists(sk)'
        }
      },
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
      }
      // ,
      // {
      //   Update: {
      //     TableName: tableName,
      //     Key: {
      //       pk: 'C',
      //       sk: `AR#${areaId}`
      //     },
      //     UpdateExpression: 'ADD #counter :incr',
      //     ExpressionAttributeNames: {
      //       '#counter': type
      //     },
      //     ExpressionAttributeValues: {
      //       ':incr': 1
      //     }
      //   }
      // }
    ]
  }

  const result = await ddb.transactWrite(params).promise()

  return result
}

module.exports = {
  getAllAlerts,
  getAlerts,
  // upsertUser,
  getAlert,
  issueAlert
}
