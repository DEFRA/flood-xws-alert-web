const joi = require('joi')
const { alertTypes, alertTypesMap } = require('flood-xws-common/data')
const { BaseViewModel, baseMessages } = require('flood-xws-common/form')

const {
  MAX_MESSAGE_HEADLINE_LENGTH,
  MAX_MESSAGE_BODY_LENGTH
} = require('flood-xws-common/constants')

const TYPE_KEY = 'type'
const TYPE_LABEL = 'Type'
const TYPE_MESSAGES = {
  'any.required': `Select a message ${TYPE_LABEL.toLowerCase()}`
}

const HEADLINE_KEY = 'headline'
const HEADLINE_LABEL = 'Headline'
const HEADLINE_MESSAGES = {
  'string.empty': `Enter a message ${HEADLINE_LABEL.toLowerCase()}`
}
const HEADLINE_OPTIONS = { rows: 2, maxlength: MAX_MESSAGE_HEADLINE_LENGTH }

const BODY_KEY = 'body'
const BODY_LABEL = 'Body'
const BODY_MESSAGES = {
  'string.empty': `Enter a message ${BODY_LABEL.toLowerCase()}`
}
const BODY_OPTIONS = { rows: 12, maxlength: MAX_MESSAGE_BODY_LENGTH }

const schema = joi.object().keys({
  // TODO: alert type constraint could be tighter using conditional based on the ta type
  [TYPE_KEY]: joi.string().valid(...alertTypes.map(item => item.id)).label(TYPE_LABEL).required().messages(TYPE_MESSAGES),
  [HEADLINE_KEY]: joi.string().max(MAX_MESSAGE_HEADLINE_LENGTH).label(HEADLINE_LABEL).required().messages(HEADLINE_MESSAGES),
  [BODY_KEY]: joi.string().max(MAX_MESSAGE_BODY_LENGTH).label(BODY_LABEL).required().messages(BODY_MESSAGES)
}).messages(baseMessages).required()

class ViewModel extends BaseViewModel {
  constructor (data, err, extra) {
    super(data, err, {
      ...extra,
      MAX_MESSAGE_HEADLINE_LENGTH,
      MAX_MESSAGE_BODY_LENGTH
    })

    const targetAreaType = this.targetArea.type
    // Hide the type control if there's only one option
    const attributes = targetAreaType.alertTypes.length === 1
      ? { hidden: true }
      : null

    const typeOptions = {
      attributes: attributes,
      items: targetAreaType.alertTypes
        .map(id => {
          const alertType = alertTypesMap.get(id)
          return {
            value: alertType.id,
            text: alertType.name,
            checked: alertType.id === this.data[TYPE_KEY]
          }
        })
    }

    // Add the form fields
    this.addField(TYPE_KEY, TYPE_LABEL, null, typeOptions)
    this.addField(HEADLINE_KEY, HEADLINE_LABEL, null, HEADLINE_OPTIONS)
    this.addField(BODY_KEY, BODY_LABEL, null, BODY_OPTIONS)
  }
}

module.exports = {
  schema,
  ViewModel
}
