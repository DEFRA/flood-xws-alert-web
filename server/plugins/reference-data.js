
const data = require('../lib/data')

const register = async (server, options) => {
  // Decorate
  server.decorate('request', 'refData', data)
  server.decorate('server', 'refData', data)
}

module.exports = {
  plugin: {
    name: 'reference-data',
    register
  }
}
