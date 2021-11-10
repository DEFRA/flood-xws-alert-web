const { Pool } = require('pg')
const db = require('common/db')
const config = require('../config')

/**
 * Create pg pool instance and common helpers
 */
const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseSsl
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

/**
 * Get a single alert template
 *
 * @param {string} ref - The template ref
 * @returns {Array} All alert templates
 */
async function getAlertTemplate (ref) {
  return queryOne('select * from xws_alert.alert_template where ref = $1;', [ref])
}

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
    insert into xws_alert.alert(
      area_code, service_id, alert_template_ref, cap_msg_type_name, cap_urgency_name,
      cap_severity_name, cap_certainty_name, headline, body, created_by_id, updated_by_id)
      select 
        $1, service_id, ref as alert_template_ref, cap_msg_type_name,
        cap_urgency_name, cap_severity_name, cap_certainty_name, $3, $4, $5, $5
      from xws_alert.alert_template
      where ref = $2 limit 1
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

/**
 * Get a single service
 *
 * @param {string} id - The service id
 * @returns {object} The service
 */
async function getService (id) {
  return queryOne('select * from xws_alert.service where id = $1;', [id])
}

/**
 * Get a single publisher
 *
 * @param {string} id - The publisher id
 * @returns {object} The publisher
 */
async function getPublisher (id) {
  return queryOne('select * from xws_alert.publisher where id = $1;', [id])
}

module.exports = {
  pool,
  query,
  queryOne,
  upsertUser,
  getArea,
  getFullArea,
  getAreas,
  getAreaAlerts,
  getAlertTemplate,
  getAlertTemplates,
  insertAlert,
  updateAlert,
  getAllAlertsReadyForApproval,
  getLiveAlerts,
  getAlert,
  approveAlert,
  deleteAlert,
  getService,
  getPublisher
}
