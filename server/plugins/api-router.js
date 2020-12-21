const routes = [].concat(
  require('../routes/api/area')
)

module.exports = {
  plugin: {
    name: 'api-router',
    register: (server, options) => {
      server.route(routes)
    }
  }
}
