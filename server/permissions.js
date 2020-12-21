const scopes = {
  alert: {
    approve: 'alert:approve',
    send: 'alert:send'
  },
  system: {
    maintain: 'system:maintain'
  }
}

const permissions = {
  Viewer: [],
  Editor: [],
  Manager: [scopes.alert.approve],
  Administrator: [scopes.alert.approve, scopes.alert.send, scopes.system.maintain]
}

module.exports = {
  scopes, permissions
}
