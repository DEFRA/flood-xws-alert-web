const joi = require('joi')
const boom = require('@hapi/boom')
const BaseModel = require('common/view/model')
const { scopes } = require('../permissions')
const { approveAlert, getAlert } = require('../lib/db')
const { issueAlert } = require('../lib/issue-alert')

class Model extends BaseModel {}

module.exports = [
  {
    method: 'GET',
    path: '/alert/{alertId}/confirm-approve',
    handler: async (request, h) => {
      const { alertId } = request.params
      const alert = await getAlert(alertId)

      if (!alert) {
        return boom.notFound()
      }

      // Check it isn't already approved
      if (alert.approved_at) {
        return h.redirect(`/alert/${alert.id}`)
      }

      return h.view('confirm-approve', new Model({ alert }))
    },
    options: {
      auth: {
        access: {
          scope: [`+${scopes.alert.approve}`]
        }
      },
      validate: {
        params: joi.object().keys({
          alertId: joi.string().guid().required()
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/alert/{alertId}/confirm-approve',
    handler: async (request, h) => {
      const { alertId } = request.params
      const { credentials } = request.auth

      // Note: In the event the alert id doesn't exist or it
      // is already approved/sent, the call will
      // not update the db and return null
      const approvedAlert = await approveAlert(credentials.user.id, alertId)

      if (approvedAlert) {
        // Todo: really what to do if this fails?
        try {
          await issueAlert(approvedAlert)
        } catch (err) {
          request.log(['error', 'publish-alert'], err)
          throw err
        }
      }

      return h.redirect('/alerts')
    },
    options: {
      auth: {
        access: {
          scope: [`+${scopes.alert.approve}`]
        }
      },
      validate: {
        params: joi.object().keys({
          alertId: joi.string().guid().required()
        })
      }
    }
  }
]
