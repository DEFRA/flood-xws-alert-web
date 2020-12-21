const joi = require('joi')
const BaseModel = require('common/view/model')
const { getMappedErrors } = require('common/view/errors')
const { getAlertTemplates } = require('../lib/db')

const errorMessages = {
  templateRef: 'Select an alert template'
}

class Model extends BaseModel {
  constructor (data, err) {
    super(data, err, errorMessages)
  }
}

async function getAlertTemplateItems () {
  const templates = await getAlertTemplates()

  return templates.map(template => ({
    text: template.name,
    value: template.ref
  }))
}

module.exports = [
  {
    method: 'GET',
    path: '/choose-alert-template',
    handler: async (request, h) => {
      const items = await getAlertTemplateItems()

      return h.view('choose-alert-template', new Model({ items }))
    }
  },
  {
    method: 'POST',
    path: '/choose-alert-template',
    handler: async (request, h) => {
      const { templateRef } = request.payload

      return h.redirect(`/create-alert/${templateRef}`)
    },
    options: {
      validate: {
        payload: joi.object().keys({
          templateRef: joi.string().required()
        }),
        failAction: async (request, h, err) => {
          const errors = getMappedErrors(err, errorMessages)
          const items = await getAlertTemplateItems()

          return h.view('choose-alert-template', new Model({
            ...request.payload,
            items
          }, errors)).takeover()
        }
      }
    }
  }
]
