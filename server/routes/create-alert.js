const joi = require('joi')
const BaseModel = require('common/view/model')
const { getMappedErrors } = require('common/view/errors')
const { insertAlert } = require('../lib/db')
const getTemplateAreas = require('../lib/get-template-areas')
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
    path: '/create-alert/{templateRef}',
    handler: async (request, h) => {
      const { templateRef } = request.params
      const items = await getTemplateAreas(templateRef)

      return h.view('create-alert', new Model({ items }))
    },
    options: {
      validate: {
        params: joi.object().keys({
          templateRef: joi.string().required()
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/create-alert/{templateRef}',
    handler: async (request, h) => {
      const { credentials } = request.auth
      const { templateRef } = request.params
      const { areaCode, headline, body } = request.payload

      await insertAlert(credentials.user.id, templateRef, areaCode, headline, body)

      return h.redirect('/alerts')
    },
    options: {
      validate: {
        params: joi.object().keys({
          templateRef: joi.string().required()
        }),
        payload: joi.object().keys({
          areaCode: joi.string().required(),
          headline: joi.string().max(MAX_MESSAGE_HEADLINE_LENGTH).required(),
          body: joi.string().max(MAX_MESSAGE_BODY_LENGTH).required()
        }),
        failAction: async (request, h, err) => {
          const errors = getMappedErrors(err, errorMessages)
          const { templateRef } = request.params
          const { areaCode } = request.payload
          const items = await getTemplateAreas(templateRef, areaCode)

          return h.view('create-alert', new Model({
            ...request.payload,
            items
          }, errors)).takeover()
        }
      }
    }
  }
]
