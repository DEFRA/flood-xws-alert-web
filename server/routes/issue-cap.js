const joi = require('joi')
const { Errors } = require('../models/form')
const { schema, ViewModel } = require('../models/issue-cap')
const { issueAlert } = require('../lib/ddb')
const { targetAreasMap } = require('../lib/data')

module.exports = [
  {
    method: 'GET',
    path: '/target-area/{code}/issue-cap',
    handler: async (request, h) => {
      const { code } = request.params
      const targetArea = targetAreasMap.get(code)
      const eaOwner = targetArea.ea_owner
      const session = request.state.session
      const data = session.issue

      const model = new ViewModel(data, undefined, { targetArea, eaOwner })

      return h.view('issue-cap', model)
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
    path: '/target-area/{code}/issue-cap',
    handler: async (request, h) => {
      const { code } = request.params
      const { state, payload } = request
      const targetArea = targetAreasMap.get(code)
      const eaOwnerId = targetArea.ea_owner_id
      const { credentials } = request.auth
      const userId = credentials.user.id
      const session = state.session
      const data = session.issue
      const { type, ...rest } = data

      try {
        const attrs = { user_id: userId, ...rest, ...payload }
        await issueAlert(eaOwnerId, code, type, attrs)
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

          return h.view('issue-cap', model).takeover()
        }
      }
    }
  }
]
