const routes = [].concat(
  require('../routes/auth'),
  require('../routes/home'),
  require('../routes/area'),
  require('../routes/target-area'),
  require('../routes/target-areas'),
  require('../routes/account'),
  require('../routes/issue'),
  require('../routes/status'),
  require('../routes/public')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, options) => {
      server.route(routes)
    }
  }
}
