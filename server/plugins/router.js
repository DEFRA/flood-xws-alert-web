const routes = [].concat(
  require('../routes/auth'),
  require('../routes/home'),
  require('../routes/owner'),
  require('../routes/target-area'),
  require('../routes/target-areas'),
  require('../routes/account'),
  require('../routes/issue'),
  require('../routes/issue-cap'),
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
