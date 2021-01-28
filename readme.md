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
| DOCUMENTATION_HOME_PAGE |                                | yes        |                               |
| PHASE_BANNER_TAG        |                                | yes        |                               |
| PHASE_BANNER_HTML       | Banner displayed on home page  | yes        |                               |
| ORGANISATION            | Organisation                   | yes        | e.g Environment Agency        |
| HAZARD                  | Hazard type                    | yes        | e.g Flood                     |
| DB                      | Database connection string     | yes        |                               |

As per [12 Factor principles](https://12factor.net/config) application config is stored in environment variables (env vars). For ease of local development the service should have a `.env` file in its root folder. Starter `.env` files for local development for this service are held in the [https://github.com/NeXt-Warning-System/config/alert-web]() repository.

Notes:
* Env var values defined in the docker-compose service override those defined in the `.env` file. See the override of the PORT env var as an example.
* `.env` files should not be committed to the service repository.
* `.env` files should not be used in production.

# Prerequisites

* [Node v12+](https://nodejs.org/en/download/)
* [Docker](https://docs.docker.com/get-docker/) 
* [Cloudfoundry CLI](https://docs.cloudfoundry.org/cf-cli/install-go-cli.html) (optional)

# Running the service

`docker-compose up --build`

Note: the above command runs this service locally. To run all of the XWS services and the DB locally then refer to [https://github.com/NeXt-Warning-System/development.git]()

# Stopping the service

CTRL-C or run `docker-compose down` from another session

# Testing

## All testing

`docker-compose run alert-web npm test`

## Unit testing only

`docker-compose run alert-web npm run unit-test`

## Linting only

`docker-compose run alert-web npm run lint`

# Key frameworks used

- [hapijs](https://github.com/hapijs/hapi) - The framework & core plugins like `joi`, `vision` etc.
- [standardjs](http://standardjs.com/) - linting
- [lab](https://github.com/hapijs/lab) - unit testing
- [code](https://github.com/hapijs/code) - code coverage

# Deploying

Deployments are to GOV.UK Platform as a Service and are done using Github actions which deploy to the sandbox envirnoment on every merge to master.

The deployments are to the xws-alert-web-sandbox app in the sandbox space in the defra-next-warning-system organisation and are accessible at [https://xws-alert-web-sandbox.london.cloudapps.digital/.](). Developers will need a login for [https://login.london.cloud.service.gov.uk/login]() to allow access to logs and diagnostic details which can't be retrieved using the cloudfoundry CLI.

## License

Contains public sector information licensed under the [Open Government license v3](./LICENCE)
