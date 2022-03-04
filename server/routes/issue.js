const joi = require('joi')
const { Errors } = require('../models/form')
const { schema, ViewModel } = require('../models/issue')
const { issueAlert } = require('../lib/ddb')
const { targetAreasMap } = require('../lib/data')

module.exports = [
  {
    method: 'GET',
    path: '/target-area/{code}/issue',
    handler: async (request, h) => {
      const { code } = request.params
      const targetArea = targetAreasMap.get(code)
      const eaOwner = targetArea.ea_owner
      const isAlertArea = !targetArea.is_warning_area
      const data = {}

      // If this is an Flood alert area, we can only issue a flood alert
      // Here we default the choice for the user and the control is hidden
      if (isAlertArea) {
        data.type = 'fa'
      }

      const model = new ViewModel(data, undefined, { targetArea, eaOwner })

      return h.view('issue', model)
    },
    options: {
      validate: {
        params: joi.object().keys({
          code: joi.string().required().valid(...targetAreasMap.keys())
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/target-area/{code}/issue',
    handler: async (request, h) => {
      const { code } = request.params
      const payload = request.payload
      const targetArea = targetAreasMap.get(code)
      const eaOwnerId = targetArea.ea_owner_id
      const { credentials } = request.auth
      const userId = credentials.user.id
      const { type, headline, body } = payload

      try {
        await issueAlert(eaOwnerId, code, type, { user_id: userId, headline, body })
      } catch (err) {
        request.log('error', err)
        // TODO: panic
        throw err
      }

      return h.redirect(`/owner/${eaOwnerId}`)
    },
    options: {
      validate: {
        params: joi.object().keys({
          code: joi.string().required().valid(...targetAreasMap.keys())
        }),
        payload: schema,
        failAction: async (request, h, err) => {
          const { params, payload } = request
          const { code } = params
          const targetArea = targetAreasMap.get(code)
          const eaOwner = targetArea.ea_owner
          const errors = Errors.fromJoi(err)
          const model = new ViewModel(payload, errors, { eaOwner, targetArea })

          return h.view('issue', model).takeover()
        }
      }
    }
  }
]
