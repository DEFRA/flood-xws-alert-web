const joi = require('joi')
const boom = require('@hapi/boom')
const BaseModel = require('common/view/model')
const { getMappedErrors } = require('common/view/errors')
const getTemplateAreas = require('../lib/get-template-areas')
const { updateAlert, getAlert } = require('../lib/db')
const {
  MAX_MESSAGE_HEADLINE_LENGTH,
  MAX_MESSAGE_BODY_LENGTH
} = require('common/constants')

const errorMessages = {
  areaCode: 'Select an alert area',
  headline: {
    'string.max': `The maximum headline length is ${MAX_MESSAGE_HEADLINE_LENGTH}`,
    '*': 'Enter the alert headline'
  },
  body: {
    'string.max': `The maximum headline length is ${MAX_MESSAGE_BODY_LENGTH}`,
    '*': 'Enter the alert body'
  }
}

class Model extends BaseModel {
  constructor (data, err) {
    super(data, err, errorMessages, {
      MAX_MESSAGE_HEADLINE_LENGTH,
      MAX_MESSAGE_BODY_LENGTH
    })
  }
}

module.exports = [
  {
    method: 'GET',
    path: '/alert/{alertId}/edit',
    handler: async (request, h) => {
      const { alertId } = request.params
      const alert = await getAlert(alertId)

      if (!alert) {
        return boom.notFound()
      }

      if (alert.approved_at) {
        return h.redirect(`/alert/${alert.id}`)
      }

      const code = alert.code
      const templateRef = alert.alert_template_ref
      const items = await getTemplateAreas(templateRef, code)

      return h.view('edit-alert', new Model({ ...alert, items, templateRef }))
    },
    options: {
      validate: {
        params: joi.object().keys({
          alertId: joi.string().guid().required()
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/alert/{alertId}/edit',
    handler: async (request, h) => {
      const { alertId } = request.params
      const { credentials } = request.auth
      const {
        areaCode,
        headline,
        body
      } = request.payload

      await updateAlert(credentials.user.id, alertId, areaCode, headline, body)

      return h.redirect(`/alert/${alertId}`)
    },
    options: {
      validate: {
        params: joi.object().keys({
          alertId: joi.string().guid().required()
        }),
        payload: joi.object().keys({
          areaCode: joi.string().required(),
          templateRef: joi.string().required(),
          headline: joi.string().max(MAX_MESSAGE_HEADLINE_LENGTH).required(),
          body: joi.string().max(MAX_MESSAGE_BODY_LENGTH).required()
        }),
        failAction: async (request, h, err) => {
          const errors = getMappedErrors(err, errorMessages)
          const { areaCode, templateRef } = request.payload
          const items = await getTemplateAreas(templateRef, areaCode)

          return h.view('edit-alert', new Model({
            ...request.payload,
            items,
            templateRef
          }, errors)).takeover()
        }
      }
    }
  }
]
