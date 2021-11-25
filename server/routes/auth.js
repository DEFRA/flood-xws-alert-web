const boom = require('@hapi/boom')
const config = require('../config')
// const { upsertUser } = require('../lib/ddb')
const { permissions } = require('../permissions')

function getPermissions (roles) {
  if (roles) {
    const parsedRoles = JSON.parse(roles)

    if (Array.isArray(parsedRoles) && parsedRoles.length) {
      const knownRoles = parsedRoles.filter(role => role in permissions)

      if (knownRoles.length) {
        return [
          knownRoles,
          Array.from(new Set(knownRoles.map(role => permissions[role]).flat()))
        ]
      }
    }
  }

  return []
}

module.exports = [
  {
    method: 'GET',
    path: '/login',
    handler: async (request, h) => {
      if (!request.auth.isAuthenticated) {
        const message = request.auth.error && request.auth.error.message
        return boom.unauthorized(`Authentication failed due to: ${message}`)
      }

      const { credentials } = request.auth
      const { profile } = credentials
      const { id, email, raw } = profile
      const { given_name: firstName, family_name: lastName } = raw
      const [roles, scope] = getPermissions(profile.raw.roles)

      if (!roles || !scope) {
        return boom.forbidden('Insufficient permissions')
      }

      const user = {
        id: id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        last_login: Date.now()
      }
      // const user = await upsertUser(id, firstName, lastName, email)

      // if (!user.active) {
      //   return boom.forbidden('Insufficient permissions')
      // }

      // Set the authentication cookie
      request.cookieAuth.set({ user, roles, scope })

      const redirectTo = credentials.query && credentials.query.redirectTo

      return h.redirect(redirectTo || '/')
    },
    options: {
      auth: 'azuread'
    }
  },
  {
    method: 'GET',
    path: '/logout',
    handler: function (request, h) {
      request.cookieAuth.clear()

      return h.redirect(`https://login.microsoftonline.com/${config.adTenant}/oauth2/v2.0/logout?post_logout_redirect_uri=${config.homePage}`)
    },
    options: {
      auth: false
    }
  }
]
