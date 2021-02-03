require('dotenv').config()
const joi = require('joi')
const envs = ['local', 'sandbox', 'test', 'production']

// Define config schema
const schema = joi.object().keys({
  env: joi.string().valid(...envs).required(),
  host: joi.string().hostname().required(),
  port: joi.number().required(),
  cookie: joi.object().keys({
    password: joi.string().min(32).required(),
    isSecure: joi.boolean().required()
  }).required(),
  forceHttps: joi.boolean().required(),
  homePage: joi.string().required(),
  documentationHomePage: joi.string().required(),
  adClientId: joi.string().required(),
  adClientSecret: joi.string().required(),
  adTenant: joi.string().required(),
  phaseBannerTag: joi.string().required(),
  phaseBannerHtml: joi.string().required(),
  organisation: joi.string().default('Environment Agency (EA)'),
  hazard: joi.string().default('Flood'),
  brokerUrl: joi.string().uri().required(),
  db: joi.string().required()
})

// Check for cloud foundry DATABASE_URL and append SSL
const cfDatabaseUrl = process.env.DATABASE_URL &&
  `${process.env.DATABASE_URL}?ssl=true`

const config = {
  env: process.env.ENV,
  host: process.env.HOST,
  port: process.env.PORT,
  cookie: {
    password: process.env.COOKIE_PASSWORD,
    isSecure: process.env.COOKIE_IS_SECURE
  },
  forceHttps: process.env.FORCE_HTTPS,
  homePage: process.env.HOME_PAGE,
  documentationHomePage: process.env.DOCUMENTATION_HOME_PAGE,
  adClientId: process.env.AD_CLIENT_ID,
  adClientSecret: process.env.AD_CLIENT_SECRET,
  adTenant: process.env.AD_TENANT,
  phaseBannerTag: process.env.PHASE_BANNER_TAG,
  phaseBannerHtml: process.env.PHASE_BANNER_HTML,
  organisation: process.env.ORGANISATION,
  hazard: process.env.HAZARD,
  brokerUrl: process.env.BROKER_URL,
  db: cfDatabaseUrl || process.env.DB
}

// Validate config
const { error, value } = schema.validate(config)

// Throw if config is invalid
if (error) {
  throw new Error(`The server config is invalid. ${error.message}`)
}

// Add some helper props
value.isLocal = value.env === 'local'

module.exports = value
