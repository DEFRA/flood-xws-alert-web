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
      const eaOwner = targetArea.eaOwner
      const isAlertArea = !targetArea.is_warning_area
      const data = {}

      // If this is an Flood alert area, we can only issue a flood alert
      // Here we default the choice for the user and the control is hidden
      if (isAlertArea) {
        data.type = 'fa'
      }

      return h.view('issue', new ViewModel(data, undefined, { eaOwner, targetArea }))
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
          const { code } = request.params
          const targetArea = targetAreasMap.get(code)
          const area = targetArea.area

          const errors = Errors.fromJoi(err)
          return h.view('issue', new ViewModel(request.payload, errors, { area, targetArea })).takeover()
        }
      }
    }
  }
]
