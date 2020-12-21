const { enqueueAlertMessageJobs } = require('../lib/db')

/**
 * Publish a single alert
 *
 * @param {object} alert - The alert to publish
 */
async function publishAlert (alert) {
  return enqueueAlertMessageJobs(alert)
}

module.exports = {
  publishAlert
}
