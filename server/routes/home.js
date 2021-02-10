module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return h.view('home', {
        organisation: 'Environment Agency (EA)',
        hazard: 'Flood'
      })
    },
    options: {
      auth: {
        mode: 'try'
      }
    }
  }
]
