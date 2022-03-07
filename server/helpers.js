function countAlertTypes (alerts, type) {
  return alerts.filter(a => a.type.id === type).length
}

function freeze (obj) {
  Object.freeze(obj)

  Object.getOwnPropertyNames(obj).forEach(function (prop) {
    if (Object.prototype.hasOwnProperty.call(obj, prop) && obj[prop] !== null &&
    (typeof obj[prop] === 'object' || typeof obj[prop] === 'function') &&
    !Object.isFrozen(obj[prop])) {
      freeze(obj[prop])
    }
  })

  return obj
}

module.exports = {
  freeze,
  countAlertTypes
}
