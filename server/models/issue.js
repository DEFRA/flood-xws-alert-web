const joi = require('joi')
const { alertTypes, alertTypesMap } = require('../lib/data')
const { BaseViewModel, baseMessages } = require('./form')

const {
  MAX_MESSAGE_HEADLINE_LENGTH,
  MAX_MESSAGE_BODY_LENGTH
} = require('flood-xws-common/constants')

const supportedAlertTypesMap = {
  faa: ['fa'],
  fwa: ['fw', 'sfw']
}

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

const BODY_KEY = 'body'
const BODY_LABEL = 'Body'
const BODY_MESSAGES = {
  'string.empty': `Enter a message ${BODY_LABEL.toLowerCase()}`
}

const schema = joi.object().keys({
  // TODO: alert type constraint could be tighter using conditional based on the ta type
  [TYPE_KEY]: joi.string().valid(...alertTypes.map(item => item.id)).label(TYPE_LABEL).required().messages(TYPE_MESSAGES),
  [HEADLINE_KEY]: joi.string().trim().max(MAX_MESSAGE_HEADLINE_LENGTH).label(HEADLINE_LABEL).required().messages(HEADLINE_MESSAGES),
  [BODY_KEY]: joi.string().trim().max(MAX_MESSAGE_BODY_LENGTH).label(BODY_LABEL).required().messages(BODY_MESSAGES)
}).messages(baseMessages).required()

class ViewModel extends BaseViewModel {
  constructor (data, err, { targetArea, ...rest }) {
    const suffix = targetArea.is_warning_area ? 'warning' : 'alert'
    const pageHeading = `Issue a flood ${suffix}`

    super(data, err, {
      ...rest,
      pageHeading,
      targetArea,
      MAX_MESSAGE_HEADLINE_LENGTH,
      MAX_MESSAGE_BODY_LENGTH
    })

    const targetAreaCategory = this.targetArea.category
    const supportedAlertTypes = supportedAlertTypesMap[targetAreaCategory.id]

    // Hide the type control if there's only one option
    const attributes = supportedAlertTypes.length === 1
      ? { hidden: true }
      : null

    const typeOptions = {
      attributes: attributes,
      items: supportedAlertTypes
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
    this.addField(TYPE_KEY, {
      name: TYPE_KEY,
      id: TYPE_KEY,
      label: {
        text: TYPE_LABEL
      },
      errorMessage: this.errors[TYPE_KEY],
      ...typeOptions
    })

    this.addField(HEADLINE_KEY, {
      name: HEADLINE_KEY,
      id: HEADLINE_KEY,
      label: {
        text: HEADLINE_LABEL
      },
      rows: 2,
      maxlength: MAX_MESSAGE_HEADLINE_LENGTH,
      value: this.data[HEADLINE_KEY],
      errorMessage: this.errors[HEADLINE_KEY]
    })

    this.addField(BODY_KEY, {
      name: BODY_KEY,
      id: BODY_KEY,
      label: {
        text: BODY_LABEL
      },
      rows: 12,
      maxlength: MAX_MESSAGE_BODY_LENGTH,
      value: this.data[BODY_KEY],
      errorMessage: this.errors[BODY_KEY]
    })
  }
}

module.exports = {
  schema,
  ViewModel
}
