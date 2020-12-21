const config = require('../config')

module.exports = {
  plugin: {
    name: 'auth',
    register: (server, options) => {
      // Setup the two authentication strategies
      server.auth.strategy('azuread', 'bell', {
        provider: 'azure-legacy',
        password: config.cookie.password,
        clientId: config.adClientId,
        clientSecret: config.adClientSecret,
        isSecure: config.cookie.isSecure,
        forceHttps: config.forceHttps,
        config: {
          tenant: config.adTenant
        }
      })

      // 30 mins sliding auth cookie
      server.auth.strategy('session', 'cookie', {
        cookie: {
          path: '/',
          password: config.cookie.password,
          isSecure: config.isSecure,
          ttl: 30 * 60 * 1000
        },
        keepAlive: true,
        redirectTo: '/login',
        appendNext: 'redirectTo'
      })

      server.auth.default('session')
    }
  }
}
