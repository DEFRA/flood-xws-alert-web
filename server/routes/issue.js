const joi = require('joi')
const { Errors } = require('../models/form')
const { schema, ViewModel } = require('../models/issue')
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
      const capDefaults = getCapDefaults(payload.type)

      // Store in session state
      h.state('session', { issue: { ...payload, ...capDefaults } })

      return h.redirect(`/target-area/${code}/issue-cap`)
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

function getCapDefaults (typeId) {
  switch (typeId) {
    case 'fa':
      return {
        cap_status: 'Actual',
        cap_msg_type: 'Alert',
        cap_scope: 'Public',
        cap_category: ['Geo', 'Met', 'Env'],
        cap_response_type: ['Monitor', 'Prepare'],
        cap_urgency: 'Expected',
        cap_severity: 'Minor',
        cap_certainty: 'Likely'
      }
    case 'fw':
      return {
        cap_status: 'Actual',
        cap_msg_type: 'Alert',
        cap_scope: 'Public',
        cap_category: ['Geo', 'Met', 'Env'],
        cap_response_type: ['Execute', 'Monitor', 'Prepare'],
        cap_urgency: 'Expected',
        cap_severity: 'Moderate',
        cap_certainty: 'Likely'
      }
    case 'sfw':
      return {
        cap_status: 'Actual',
        cap_msg_type: 'Alert',
        cap_scope: 'Public',
        cap_category: ['Geo', 'Met', 'Env'],
        cap_response_type: ['Shelter', 'Evacuate', 'Execute', 'Monitor', 'Prepare'],
        cap_urgency: 'Immediate',
        cap_severity: 'Severe',
        cap_certainty: 'Observed'
      }
    case 'wnlif':
      return {
        cap_status: 'Actual',
        cap_msg_type: 'Cancel',
        cap_scope: 'Public',
        cap_category: ['Geo', 'Met', 'Env'],
        cap_response_type: ['AllClear'],
        cap_urgency: 'Past',
        cap_severity: 'Unknown',
        cap_certainty: 'Unknown'
      }
  }
}
