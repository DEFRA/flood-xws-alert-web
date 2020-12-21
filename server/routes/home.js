const { organisation, hazard } = require('../config')

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return h.view('home', {
        organisation,
        hazard
      })
    },
    options: {
      auth: {
        mode: 'try'
      }
    }
  }
]
