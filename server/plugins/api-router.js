const routes = []

module.exports = {
  plugin: {
    name: 'api-router',
    register: (server, options) => {
      server.route(routes)
    }
  }
}
