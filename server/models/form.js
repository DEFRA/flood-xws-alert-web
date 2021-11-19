function mapErrors (err) {
  if (err && Array.isArray(err.details)) {
    const errors = {}
    const errorList = []

    err.details.forEach(error => {
      const path = error.path[0]
      const text = error.message
      const type = error.type

      errors[path] = { text, type }
      errorList.push({ text, type, path, href: `#${path}` })
    })

    return [
      errors,
      errorList
    ]
  }

  return []
}

const baseMessages = {
  'string.max': '{{#label}} must be {{#limit}} characters or fewer'
}

class BaseViewModel {
  constructor (data, err, extra) {
    const [errors, errorList] = mapErrors(err)
    this.data = data
    this.errors = errors
    this.errorList = errorList
    this.fields = {}
    Object.assign(this, extra)
  }

  registerField (key, config) {
    this.fields[key] = config
  }

  // Common helper to create a govuk component config
  addField (key, label, classes, ...rest) {
    this.registerField(key, Object.assign({
      id: key,
      name: key,
      label: typeof label === 'string' ? { text: label } : label,
      value: this.data[key],
      errorMessage: this.errors?.[key],
      classes: classes
    }, ...rest))
  }
}

module.exports = {
  mapErrors,
  baseMessages,
  BaseViewModel
}
