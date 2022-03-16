const AWS = require('aws-sdk')
const { v4: uuid } = require('uuid')
const config = require('../config')
const { alertTypesMap, eaAreasMap, eaOwnersMap } = require('./data')
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

async function getAlerts (ownerId) {
  const result = await ddb.query({
    KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': 'A',
      ':sk': `O#${ownerId}#`
    },
    TableName: tableName
  }).promise()

  return result.Items.map(formatAlert)
}

async function getAlert (ownerId, code, includeData = true) {
  const result = await ddb.get({
    Key: {
      pk: 'A',
      sk: `O#${ownerId}#TA#${code}`
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
  const ownerId = split[1]
  const eaOwner = eaOwnersMap.get(ownerId)
  const eaAreaId = eaOwner.ea_area_id
  const eaArea = eaAreasMap.get(eaAreaId)

  return {
    id: alert.id,
    code: split[3],
    updated: alert.updated,
    eaOwner,
    eaArea,
    type: alertTypesMap.get(alert.type_id)
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

async function issueAlert (eaOwnerId, code, typeId, attributes) {
  const id = uuid()
  const updated = Date.now()
  const eaOwner = eaOwnersMap.get(eaOwnerId)
  const eaAreaId = eaOwner.ea_area_id

  const params = {
    TransactItems: [
      {
        Put: {
          TableName: tableName,
          Item: {
            pk: 'AD',
            sk: id,
            code,
            type_id: typeId,
            ea_owner_id: eaOwnerId,
            ea_area_id: eaAreaId,
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
            sk: `O#${eaOwnerId}#TA#${code}`,
            id,
            type_id: typeId,
            updated
          },
          ConditionExpression: 'attribute_not_exists(sk)'
        }
      },
      {
        Put: {
          TableName: tableName,
          Item: {
            pk: 'AA',
            sk: `O#${eaOwnerId}#TA#${code}#${id}`,
            id,
            code,
            type_id: typeId,
            ea_owner_id: eaOwnerId,
            ea_area_id: eaAreaId,
            updated,
            ...attributes
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
      //       sk: `O#${ownerId}`
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
