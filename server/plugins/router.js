const routes = [].concat(
  require('../routes/auth'),
  require('../routes/home'),
  require('../routes/account'),
  require('../routes/alerts'),
  require('../routes/alert'),
  require('../routes/area'),
  require('../routes/choose-alert-template'),
  require('../routes/create-alert'),
  require('../routes/edit-alert'),
  require('../routes/confirm-delete'),
  require('../routes/confirm-approve'),
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
