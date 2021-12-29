# alert-web

Internal facing website for issuing alerts

# Environment variables

| name                    | description                    | required   | valid                         |
| ----------              | ------------------             | :--------: | :---------------------------: |
| ENV                     | Deployment environment         | yes        | local,sandbox,test,production |
| HOST                    | Hostname                       | yes        |                               |
| PORT                    | Port number                    | yes        |                               |
| COOKIE_PASSWORD         |                                | yes        |                               |
| COOKIE_IS_SECURE        |                                | yes        |                               |
| FORCE_HTTPS             |                                | yes        |                               |
| AD_CLIENT_ID            | Active directory client id     | yes        |                               |
| AD_CLIENT_SECRET        | Active directory client secret | yes        |                               |
| AD_TENANT               | Active directory tenant        | yes        |                               |
| HOME_PAGE               |                                | yes        |                               |
| DYNAMODB_TABLE_NAME     | DynamoDB table name            | yes        |                               |

As per [12 Factor principles](https://12factor.net/config) application config is stored in environment variables (env vars). For ease of local development the service should have a `.env` file in its root folder. Starter `.env` files for local development for this service are held in the [xws config repo](https://github.com/DEFRA/flood-xws-config/tree/master/flood-xws-alert-web) repository.

# Prerequisites

* [Node v14+](https://nodejs.org/en/download/)

# Running the service

`node index.js`

# Testing

## All testing

`npm test`

## Unit testing only

`npm run unit-test`

## Linting

`npm run lint`

# Key frameworks used

- [hapijs](https://github.com/hapijs/hapi) - The framework & core plugins like `joi`, `vision` etc.
- [standardjs](http://standardjs.com/) - linting
- [lab](https://github.com/hapijs/lab) - unit testing
- [code](https://github.com/hapijs/code) - code coverage

## License

Contains public sector information licensed under the [Open Government license v3](./LICENCE)
