const joi = require('joi')
const { alertTypes, alertTypesMap } = require('../lib/data')
const { BaseViewModel, baseMessages } = require('./form')
const capSeverity = require('flood-xws-common/data/cap/severity.json')
const capCertainty = require('flood-xws-common/data/cap/certainty.json')
const capUrgency = require('flood-xws-common/data/cap/urgency.json')
const capMsgType = require('flood-xws-common/data/cap/msg-type.json')
const capScope = require('flood-xws-common/data/cap/scope.json')
const capResponseType = require('flood-xws-common/data/cap/response-type.json')
const capStatus = require('flood-xws-common/data/cap/status.json')
const capCategory = require('flood-xws-common/data/cap/category.json')

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

const CAP_STATUS_KEY = 'cap_status'
const CAP_STATUS_LABEL = 'Status'
const CAP_STATUS_MESSAGES = {
  'string.empty': `Choose a ${CAP_STATUS_LABEL.toLowerCase()}`
}

const CAP_MSG_TYPE_KEY = 'cap_msg_type'
const CAP_MSG_TYPE_LABEL = 'Msg Type'
const CAP_MSG_TYPE_MESSAGES = {
  'string.empty': `Choose a ${CAP_MSG_TYPE_LABEL.toLowerCase()}`
}

const CAP_SCOPE_KEY = 'cap_scope'
const CAP_SCOPE_LABEL = 'Scope'
const CAP_SCOPE_MESSAGES = {
  'string.empty': `Choose a ${CAP_SCOPE_LABEL.toLowerCase()}`
}

const CAP_RESPONSE_TYPE_KEY = 'cap_response_type'
const CAP_RESPONSE_TYPE_LABEL = 'Response Type'
const CAP_RESPONSE_TYPE_MESSAGES = {
  'string.empty': `Choose a ${CAP_RESPONSE_TYPE_LABEL.toLowerCase()}`
}

const CAP_CATEGORY_KEY = 'cap_category'
const CAP_CATEGORY_LABEL = 'Category'
const CAP_CATEGORY_MESSAGES = {
  'string.empty': `Choose a ${CAP_CATEGORY_LABEL.toLowerCase()}`
}

const CAP_SEVERITY_KEY = 'cap_severity'
const CAP_SEVERITY_LABEL = 'Severity'
const CAP_SEVERITY_MESSAGES = {
  'string.empty': `Choose a ${CAP_SEVERITY_LABEL.toLowerCase()}`
}

const CAP_URGENCY_KEY = 'cap_urgency'
const CAP_URGENCY_LABEL = 'Urgency'
const CAP_URGENCY_MESSAGES = {
  'string.empty': `Choose a ${CAP_URGENCY_LABEL.toLowerCase()}`
}

const CAP_CERTAINTY_KEY = 'cap_certainty'
const CAP_CERTAINTY_LABEL = 'Certainty'
const CAP_CERTAINTY_MESSAGES = {
  'string.empty': `Choose a ${CAP_CERTAINTY_LABEL.toLowerCase()}`
}

const schema = joi.object().keys({
  // TODO: alert type constraint could be tighter using conditional based on the ta type
  [TYPE_KEY]: joi.string().valid(...alertTypes.map(item => item.id)).label(TYPE_LABEL).required().messages(TYPE_MESSAGES),
  [HEADLINE_KEY]: joi.string().trim().max(MAX_MESSAGE_HEADLINE_LENGTH).label(HEADLINE_LABEL).required().messages(HEADLINE_MESSAGES),
  [BODY_KEY]: joi.string().trim().max(MAX_MESSAGE_BODY_LENGTH).label(BODY_LABEL).required().messages(BODY_MESSAGES),
  [CAP_STATUS_KEY]: joi.string().valid(...capStatus.map(item => item.name)).label(CAP_STATUS_LABEL).required().messages(CAP_STATUS_MESSAGES),
  [CAP_MSG_TYPE_KEY]: joi.string().valid(...capMsgType.map(item => item.name)).label(CAP_MSG_TYPE_LABEL).required().messages(CAP_MSG_TYPE_MESSAGES),
  [CAP_SCOPE_KEY]: joi.string().valid(...capScope.map(item => item.name)).label(CAP_SCOPE_LABEL).required().messages(CAP_SCOPE_MESSAGES),
  [CAP_CATEGORY_KEY]: joi.array().items(joi.string().valid(...capCategory.map(item => item.name))).label(CAP_CATEGORY_LABEL).required().messages(CAP_CATEGORY_MESSAGES).single(),
  [CAP_RESPONSE_TYPE_KEY]: joi.array().items(joi.string().valid(...capResponseType.map(item => item.name))).label(CAP_RESPONSE_TYPE_LABEL).default([]).messages(CAP_RESPONSE_TYPE_MESSAGES).single(),
  [CAP_SEVERITY_KEY]: joi.string().valid(...capSeverity.map(item => item.name)).label(CAP_SEVERITY_LABEL).required().messages(CAP_SEVERITY_MESSAGES),
  [CAP_URGENCY_KEY]: joi.string().valid(...capUrgency.map(item => item.name)).label(CAP_URGENCY_LABEL).required().messages(CAP_URGENCY_MESSAGES),
  [CAP_CERTAINTY_KEY]: joi.string().valid(...capCertainty.map(item => item.name)).label(CAP_CERTAINTY_LABEL).required().messages(CAP_CERTAINTY_MESSAGES)
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

    this.addField(CAP_STATUS_KEY, {
      name: CAP_STATUS_KEY,
      id: CAP_STATUS_KEY,
      label: { text: CAP_STATUS_LABEL },
      items: capStatus.map(capMapper(this.data[CAP_STATUS_KEY])),
      value: this.data[CAP_STATUS_KEY],
      errorMessage: this.errors[CAP_STATUS_KEY]
    })

    this.addField(CAP_MSG_TYPE_KEY, {
      name: CAP_MSG_TYPE_KEY,
      id: CAP_MSG_TYPE_KEY,
      label: { text: CAP_MSG_TYPE_LABEL },
      items: capMsgType.map(capMapper(this.data[CAP_MSG_TYPE_KEY])),
      value: this.data[CAP_MSG_TYPE_KEY],
      errorMessage: this.errors[CAP_MSG_TYPE_KEY]
    })

    this.addField(CAP_SCOPE_KEY, {
      name: CAP_SCOPE_KEY,
      id: CAP_SCOPE_KEY,
      label: { text: CAP_SCOPE_LABEL },
      items: capScope.map(capMapper(this.data[CAP_SCOPE_KEY])),
      value: this.data[CAP_SCOPE_KEY],
      errorMessage: this.errors[CAP_SCOPE_KEY]
    })

    this.addField(CAP_CATEGORY_KEY, {
      name: CAP_CATEGORY_KEY,
      id: CAP_CATEGORY_KEY,
      label: { text: CAP_CATEGORY_LABEL },
      classes: 'govuk-checkboxes--small',
      items: capCategory.map(capMapper(this.data[CAP_CATEGORY_KEY], 'checked', arrayCompare)),
      value: this.data[CAP_CATEGORY_KEY],
      errorMessage: this.errors[CAP_CATEGORY_KEY]
    })

    this.addField(CAP_RESPONSE_TYPE_KEY, {
      name: CAP_RESPONSE_TYPE_KEY,
      id: CAP_RESPONSE_TYPE_KEY,
      label: { text: CAP_RESPONSE_TYPE_LABEL },
      classes: 'govuk-checkboxes--small',
      items: capResponseType.map(capMapper(this.data[CAP_RESPONSE_TYPE_KEY], 'checked', arrayCompare)),
      value: this.data[CAP_RESPONSE_TYPE_KEY],
      errorMessage: this.errors[CAP_RESPONSE_TYPE_KEY]
    })

    this.addField(CAP_SEVERITY_KEY, {
      name: CAP_SEVERITY_KEY,
      id: CAP_SEVERITY_KEY,
      label: { text: CAP_SEVERITY_LABEL },
      items: capSeverity.map(capMapper(this.data[CAP_SEVERITY_KEY])),
      value: this.data[CAP_SEVERITY_KEY],
      errorMessage: this.errors[CAP_SEVERITY_KEY]
    })

    this.addField(CAP_URGENCY_KEY, {
      name: CAP_URGENCY_KEY,
      id: CAP_URGENCY_KEY,
      label: { text: CAP_URGENCY_LABEL },
      items: capUrgency.map(capMapper(this.data[CAP_URGENCY_KEY])),
      value: this.data[CAP_URGENCY_KEY],
      errorMessage: this.errors[CAP_URGENCY_KEY]
    })

    this.addField(CAP_CERTAINTY_KEY, {
      name: CAP_CERTAINTY_KEY,
      id: CAP_CERTAINTY_KEY,
      label: { text: CAP_CERTAINTY_LABEL },
      items: capCertainty.map(capMapper(this.data[CAP_CERTAINTY_KEY])),
      value: this.data[CAP_CERTAINTY_KEY],
      errorMessage: this.errors[CAP_CERTAINTY_KEY]
    })
  }
}

const defaultCompare = (item, value) => item.name === value
const arrayCompare = (item, value) => Array.isArray(value)
  ? value.includes(item.name)
  : defaultCompare(item, value)
const capMapper = (value, prop = 'selected', compare = defaultCompare) => item => {
  return {
    value: item.name,
    text: item.name,
    [prop]: compare(item, value)
  }
}

module.exports = {
  schema,
  ViewModel
}
