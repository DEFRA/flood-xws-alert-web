# flood-xws-alert-web

Internal facing "Manage flood alerts" website for issuing alerts

# Environment variables

| name                    | description                    | required   | valid                         |
| --------------------:   | --------------------------:    | :--------: | :---------------------------: |
| ENV                     | Deployment environment         | yes        | sandbox,test,production       |
| HOST                    | Hostname                       | yes        |                               |
| PORT                    | Port number                    | yes        |                               |
| COOKIE_PASSWORD         |                                | yes        |                               |
| COOKIE_IS_SECURE        |                                | yes        |                               |
| FORCE_HTTPS             |                                | yes        |                               |
| AD_CLIENT_ID            | Active directory client id     | yes        |                               |
| AD_CLIENT_SECRET        | Active directory client secret | yes        |                               |
| AD_TENANT               | Active directory tenant        | yes        |                               |
| HOME_PAGE               | The home page URL              | yes        |                               |
| DYNAMODB_TABLE_NAME     | DynamoDB table name            | yes        |                               |
| S3_BUCKET_URL           | S3 bucket url                  | yes        |                               |

As per [12 Factor principles](https://12factor.net/config) application config is stored in environment variables (env vars). For ease of local development the service should have a `.env` file in its root folder. Starter `.env` files for local development for this service are held in the [xws config repo](https://github.com/DEFRA/flood-xws-config/tree/master/flood-xws-alert-web) repository.

# Prerequisites

* [Node v14+](https://nodejs.org/en/download/)

# Running the application

First install the dependencies and build the application using:

`$ npm i`

`$ npm run build`

Now the application is ready to run:

`$ node index.js`

Check the server is running by pointing your browser to `http://localhost:3000`

## License

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the license

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.

