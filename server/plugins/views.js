const path = require('path')
const nunjucks = require('nunjucks')
const config = require('../config')
const pkg = require('../../package.json')
const { date, alertTypeTag, areaCategoryTag, targetAreaTypeTag } = require('../lib/filters')
const serviceName = 'Manage flood alerts'
const { markSafe } = require('nunjucks/src/runtime')

module.exports = {
  plugin: require('@hapi/vision'),
  options: {
    engines: {
      html: {
        compile: (src, options) => {
          const template = nunjucks.compile(src, options.environment)

          return (context) => {
            return template.render(context)
          }
        },
        prepare: (options, next) => {
          const env = options.compileOptions.environment = nunjucks.configure([
            path.join(options.relativeTo || process.cwd(), options.path),
            'node_modules/govuk-frontend/'
          ], {
            autoescape: true,
            watch: false
          })

          // Register globals/filters
          env.addGlobal('alertTypeTag', markSafe(alertTypeTag))
          env.addGlobal('areaCategoryTag', markSafe(areaCategoryTag))
          env.addGlobal('targetAreaTypeTag', markSafe(targetAreaTypeTag))

          env.addFilter('date', date)

          return next()
        }
      }
    },
    path: '../views',
    relativeTo: __dirname,
    isCached: !config.isDev,
    context: {
      appVersion: pkg.version,
      assetPath: '/assets',
      serviceName: serviceName,
      pageTitle: `${serviceName}`
    }
  }
}
