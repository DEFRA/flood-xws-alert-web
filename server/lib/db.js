const { Pool } = require('pg')
const db = require('common/db')
const config = require('../config')

/**
 * Create pg pool instance and common helpers
 */
const pool = new Pool({
  connectionString: config.db
})

const { query, queryOne } = db(pool)

/**
 * Upsert a user
 *
 * @param {string} userId - The created by user id
 * @param {string} firstName - The user's first name
 * @param {string} lastName - The user's last name
 * @param {string} email - The user's email address
 */
function upsertUser (userId, firstName, lastName, email) {
  return queryOne(`
    insert into xws_alert.user(id, first_name, last_name, email)
    values($1, $2, $3, $4)
    on conflict (id) do update set first_name = $2, last_name = $3, email = $4, updated_at = CURRENT_TIMESTAMP
    returning *
  `, [userId, firstName, lastName, email])
}

// /**
//  * Find FAA by text string
//  *
//  * @param {string} query - Searches across fws_tacode or ta_name
//  * @returns {Array} List of matching target areas
//  */
// async function findFloodAlertAreas (query) {
//   return query(`
//     select gid, area, fws_tacode, ta_name from faa
//     where faa.fws_tacode LIKE $1
//     or faa.ta_name LIKE $2
//     limit 50;
//   `, [`${query}%`, `%${query}%`])
// }

// /**
//  * Find FWA by text string
//  *
//  * @param {string} query - Searches across fws_tacode or ta_name
//  * @returns {Array} List of matching target areas
//  */
// async function findFloodWarningAreas (query) {
//   return query(`
//     select gid, area, fws_tacode, ta_name from faa
//     where faa.fws_tacode LIKE $1
//     or faa.ta_name LIKE $2
//     limit 50;
//   `, [`${query}%`, `%${query}%`])
// }

/**
 * Get all alert templates
 *
 * @returns {Array} All alert templates
 */
async function getAlertTemplates () {
  return query('select * from xws_alert.alert_template;')
}

/**
 * Get all areas
 *
 * @returns {Array} All areas
 */
async function getAreas () {
  return query('select * from xws_area.area_vw_summary;')
}

/**
 * Get a single area
 *
 * @param {string} code - The area code
 * @returns {object} Area summary
 */
async function getArea (code) {
  return queryOne('select * from xws_area.area_vw_summary where code = $1;', [code])
}

/**
 * Get a single full area
 *
 * @param {string} code - The area code
 * @returns {object} Area
 */
async function getFullArea (code) {
  return queryOne('select *, st_asgeojson(geom) as geom from xws_area.area where code = $1;', [code])
}

/**
 * Insert a single alert
 *
 * @param {string} userId - The created by user id
 * @param {string} areaCode - The area code to send the alert to
 * @param {string} headline - The alert headline
 * @param {string} body - The alert body
 */
function insertAlert (userId, templateRef, areaCode, headline, body) {
  return queryOne(`
    insert into xws_alert.alert(area_code, alert_template_ref, headline, body, created_by_id, updated_by_id)
    values($1, $2, $3, $4, $5, $5)
    returning *
  `, [areaCode, templateRef, headline, body, userId])
}

/**
 * Update a single alert
 *
 * @param {string} userId - The updated by user id
 * @param {string} alertId - The alert id
 * @param {string} areaCode - The area code to send the alert to
 * @param {string} headline - The alert headline
 * @param {string} body - The alert body
 */
function updateAlert (userId, alertId, areaCode, headline, body) {
  return query(`
    update xws_alert.alert
    set
      area_code = $1,
      headline = $2,
      body = $3,
      updated_by_id = $4,
      updated_at = CURRENT_TIMESTAMP
    where approved_by_id is null and id = $5
    returning *
  `, [areaCode, headline, body, userId, alertId])
}

/**
 * Get all alerts that are ready for approval
 */
function getAllAlertsReadyForApproval () {
  return query(`
    select a.*, avs.*, CONCAT(u.first_name, ' ', u.last_name) as created_by
    from xws_alert.alert a
    join xws_area.area_vw_summary avs on avs.code = a.area_code
    join xws_alert.user u on u.id = a.created_by_id
    where a.approved_by_id is null
    order by a.created_at
  `)
}

/**
 * Get all alerts that are live
 */
function getLiveAlerts () {
  return query(`
    select a.*, avs.*,
      CONCAT(u1.first_name, ' ', u1.last_name) as created_by, 
      CONCAT(u2.first_name, ' ', u2.last_name) as approved_by
    from xws_alert.alert_vw_active a
    join xws_area.area_vw_summary avs on avs.code = a.area_code
    join xws_alert.user u1 on u1.id = a.created_by_id
    join xws_alert.user u2 on u2.id = a.approved_by_id
    where a.active = true and a.approved_by_id is not null
    order by a.created_at
  `)
}

// /**
//  * Get all messages that have been recently sent
//  */
// function getAllInfoActiveMessages () {
//   return query(`
//     select m.*,
//       g.name as group_name,
//       g.code as group_code,
//       g.type as group_type,
//       CONCAT(u1.first_name, ' ', u1.last_name) as created_by,
//       CONCAT(u2.first_name, ' ', u2.last_name) as approved_by,
//       CONCAT(u3.first_name, ' ', u3.last_name) as sent_by
//     from xws_alert.message m
//     join xws_alert.group g on g.id = m.group_id
//     join xws_alert.user u1 on u1.id = m.created_by_id
//     join xws_alert.user u2 on u2.id = m.approved_by_id
//     join xws_alert.user u3 on u3.id = m.sent_by_id
//     where m.sent_by_id is not null and info_active = true
//     order by m.sent_at desc
//   `)
// }

/**
 * Get a single alert
 *
 * @param {string} alertId - The alert id
 */
function getAlert (alertId) {
  return queryOne(`
    select a.*, avs.*,
      u1.email as created_by,
      u2.email as updated_by,
      u3.email as approved_by
    from xws_alert.alert a
    join xws_area.area_vw_summary avs on avs.code = a.area_code
    join xws_alert.user u1 on u1.id = a.created_by_id
    join xws_alert.user u2 on u2.id = a.updated_by_id
    left join xws_alert.user u3 on u3.id = a.approved_by_id
    where a.id = $1
  `, [alertId])
}

/**
 * Get area alerts
 *
 * @param {string} code - The area code
 */
// Todo: Don't leak SQL implementation here
function getAreaAlerts (code, active = true, orderBy = 'created_at DESC', limit = 20, expired) {
  return query(`
    select a.*, avs.*,
      u1.email as created_by,
      u2.email as updated_by,
      u3.email as approved_by
    from xws_alert.alert a
    join xws_area.area_vw_summary avs on avs.code = a.area_code
    join xws_alert.user u1 on u1.id = a.created_by_id
    join xws_alert.user u2 on u2.id = a.updated_by_id
    left join xws_alert.user u3 on u3.id = a.approved_by_id
    where avs.code = $1
    and a.active ${active === null ? 'is null' : `= ${active}`}
    ${expired ? 'and expired_at is not null' : 'and expired_at is null'}
    ${orderBy === null ? '' : `order by a.${orderBy}`}
    ${limit <= 0 ? ';' : 'limit $2;'}
  `, [code, limit])
}

/**
 * Delete a single alert
 *
 * @param {string} alertId - The alert id
 */
function deleteAlert (alertId) {
  return queryOne(`
    delete from xws_alert.alert where approved_by_id is null and id = $1
  `, [alertId])
}

/**
 * Approve a single alert
 *
 * @param {string} userId - The approved by user id
 * @param {string} alertId - The alert id
 */
function approveAlert (userId, alertId) {
  return queryOne(`
    update xws_alert.alert
    set
      active = true,
      updated_by_id = $1,
      updated_at = CURRENT_TIMESTAMP,
      approved_by_id = $1,
      approved_at = CURRENT_TIMESTAMP
    where approved_by_id is null and id = $2
    returning *
  `, [userId, alertId])
}

// /**
//  * Send a single message
//  *
//  * @param {string} userId - The sent by user id
//  * @param {string} messageId - The message id
//  */
// function sendMessage (userId, messageId) {
//   return queryOne(`
//     update xws_alert.message
//     set
//       updated_by_id = $1,
//       updated_at = CURRENT_TIMESTAMP,
//       sent_by_id = $1,
//       sent_at = CURRENT_TIMESTAMP,
//       info_active = CASE WHEN info is not null THEN true ELSE null END
//     where approved_by_id is not null and sent_by_id is null and id = $2
//     returning *
//   `, [userId, messageId])
// }

// /**
//  * Get the contact count for a group
//  *
//  * @param {object} message - The message object
//  */
// function getGroupContactsCount (message) {
//   const { group_id: groupId } = message

//   return queryOne(`
//     select count(0) from xws_alert.membership m
//     join xws_alert.contact c on c.id = m.contact_id
//     where group_id = $1
//   `, [groupId])
// }

/**
 * Enqueue message jobs
 *
 * @param {object} alert - The alert
 */
function enqueueAlertMessageJobs (alert) {
  return query(`
    insert into xws_notification.message_queue(queue, data)
    select
      'text' as queue,
      json_build_object('contact', c, 'alert', $1::json) as args
    from (
      select distinct c.*
      from xws_contact.contact c
      join xws_contact.subscription s
        on c.id = s.contact_id
      join xws_contact.location l
        on l.id = s.location_id
      join xws_area.area ar
        on ST_Intersects(l.geom, ar.geom)
      where c.active = true
        and c.contact_type_name = 'public'
        and c.hazard_name = 'flood'
        ${alert.alert_template_ref === 'fa' ? 'and s.alerts = true' : ''}
        and ar.code = $2
    ) as c
  `, [alert, alert.area_code])
}

// /**
//  * Insert message job result
//  *
//  * @param {string} reference - The message reference
//  * @param {object} jobData - The job data
//  * @param {object} result - The notify result
//  */
// function insertMessageJobSentResult (reference, jobData, result) {
//   return query(`
//     insert into xws_alert.message_sent(reference, message_id, contact_id, mobile, result)
//     values ($1, $2, $3, $4, $5::json)
//   `, [reference, jobData.message.id, jobData.contact.id, jobData.contact.mobile, result])
// }

// /**
//  * Update message sent result with notify delivery data
//  *
//  * @param {object} deliveryResult - The notify delivery result
//  */
// function updateMessageJobSentDeliveryResult (deliveryResult) {
//   return query(`
//     update xws_alert.message_sent
//     set
//       delivery_status = $2,
//       delivery_to = $3,
//       delivery_result = $4,
//       delivery_created_at = CURRENT_TIMESTAMP
//     where reference = $1
//   `, [deliveryResult.reference, deliveryResult.status, deliveryResult.to, deliveryResult])
// }

// /**
//  * Insert message job failed result
//  *
//  * @param {string} reference - The message reference
//  * @param {object} jobData - The job data
//  * @param {object} result - The notify result
//  */
// function insertMessageJobFailedResult (reference, jobData, result) {
//   return query(`
//     insert into xws_alert.message_failed(reference, message_id, contact_id, mobile, result)
//     values ($1, $2, $3, $4, $5::json)
//   `, [reference, jobData.message.id, jobData.contact.id, jobData.contact.mobile, result])
// }

module.exports = {
  pool,
  query,
  queryOne,
  upsertUser,
  getArea,
  getFullArea,
  getAreas,
  getAreaAlerts,
  getAlertTemplates,
  insertAlert,
  updateAlert,
  getAllAlertsReadyForApproval,
  getLiveAlerts,
  getAlert,
  // sendMessage,
  approveAlert,
  deleteAlert,
  // deactivateMessage,
  // getGroupContactsCount,
  enqueueAlertMessageJobs
  // insertMessageJobSentResult,
  // insertMessageJobFailedResult,
  // updateMessageJobSentDeliveryResult
}
