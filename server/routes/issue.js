const joi = require('joi')
const { Errors } = require('../models/form')
const { schema, ViewModel } = require('../models/issue')
const { issueAlert } = require('../lib/ddb')
const { targetAreasMap } = require('flood-xws-common/data')

module.exports = [
  {
    method: 'GET',
    path: '/target-area/{code}/issue',
    handler: async (request, h) => {
      const { code } = request.params
      const targetArea = targetAreasMap.get(code)
      const area = targetArea.area
      const isAlertArea = !targetArea.isWarningArea
      const data = {}

      // If this is an Flood alert area, we can only issue a flood alert
      // Here we default the choice for the user and the control is hidden
      if (isAlertArea) {
        data.type = 'fa'
      }

      return h.view('issue', new ViewModel(data, undefined, { area, targetArea }))
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
      const areaId = targetArea.area.id
      const { credentials } = request.auth
      const userId = credentials.user.id
      const type = payload.type

      try {
        await issueAlert(areaId, code, type, { user_id: userId, ...payload })
      } catch (err) {
        request.log('error', err)
      }

      return h.redirect(`/area/${areaId}`)
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
