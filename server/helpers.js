function countAlertTypes (alerts, type) {
  return alerts.filter(a => a.type.id === type).length
}

module.exports = {
  countAlertTypes
}
