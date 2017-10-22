# Change Log

## Unreleased

## 2.3.0 - 2017-09-05

### Changed

-   API-101: Call to Server CLI Service for AWS credentials instead of Auth0

### Dependencies

-   update [@blinkmobile/bm-identity](https://www.npmjs.com/package/@blinkmobile/bm-identity) to [3.1.0](https://github.com/blinkmobile/bm-identity.js/releases/tag/3.1.0) (from [2.3.5](https://github.com/blinkmobile/bm-identity.js/releases/tag/2.3.5))

-   update [archiver](https://www.npmjs.com/package/archiver) to [2.1.0](https://github.com/archiverjs/node-archiver/blob/master/CHANGELOG.md) (from [2.0.3](https://github.com/archiverjs/node-archiver/releases/tag/2.0.3))

-   update [aws-sdk](https://www.npmjs.com/package/aws-sdk) to [2.138.0](https://github.com/aws/aws-sdk-js/releases/tag/v2.138.0) (from [2.108.0](https://github.com/aws/aws-sdk-js/releases/tag/v2.108.0))

-   update [chalk](https://www.npmjs.com/package/chalk) to [2.2.0](https://github.com/chalk/chalk/releases/tag/v2.2.0) (from 2.1.0)

-   update [hapi](https://www.npmjs.com/package/hapi) to 16.6.2 (from 16.5.2)

-   update [inquirer](https://www.npmjs.com/package/inquirer) to [3.3.0](https://github.com/SBoudrias/Inquirer.js/releases/tag/v3.3.0) (from [3.2.3](https://github.com/SBoudrias/Inquirer.js/releases/tag/v3.2.3))

-   update [js-yaml](https://www.npmjs.com/package/js-yaml) to [3.10.0](https://github.com/nodeca/js-yaml/blob/master/CHANGELOG.md) (from [3.9.1](https://github.com/nodeca/js-yaml/blob/master/CHANGELOG.md))

-   update [log-symbols](https://www.npmjs.com/package/log-symbols) to 2.1.0 (from 2.0.0)

-   update [log-update](https://www.npmjs.com/package/log-update) to 2.2.0 (from 2.1.0)

-   update [request](https://www.npmjs.com/package/request) to [2.83.0](https://github.com/request/request/blob/master/CHANGELOG.md) (from [2.81.0](https://github.com/request/request/blob/master/CHANGELOG.md))

-   update [serverless](https://www.npmjs.com/package/serverless) to [1.23.0](https://github.com/serverless/serverless/releases/tag/v1.23.0) (from [1.21.0](https://github.com/serverless/serverless/releases/tag/v1.21.0))

-   update [update-notifier](https://www.npmjs.com/package/update-notifier) to 2.3.0 (from [2.2.0](https://github.com/yeoman/update-notifier/releases/tag/v2.2.0))

-   update [write-json-file](https://www.npmjs.com/package/write-json-file) to 2.3.0 (from 2.2.0)

## 2.2.0 - 2017-09-05

### Added

-   API-7: support for storing [_Scoped_ and _Unscoped_ Environment Variables](./docs/environment-variables.md) in configuration

### Dependencies

-   update [aws-sdk](https://www.npmjs.com/package/aws-sdk) to [2.108.0](https://github.com/aws/aws-sdk-js/releases/tag/v2.108.0) (from [2.107.0](https://github.com/aws/aws-sdk-js/blob/master/CHANGELOG.md))

## 2.1.0 - 2017-09-01

### Changed

-   AUTH-49: Server CLI Service origin and S3 Bucket to environment variables with sensible defaults. These values can also be configured via `.blinkmrc.json`. See [Server CLI Service documentation](./docs/server-cli-service.md).

### Dependencies

-   update [archiver](https://www.npmjs.com/package/archiver) to [2.0.3](https://github.com/archiverjs/node-archiver/releases/tag/2.0.3) (from [1.3.0](https://github.com/archiverjs/node-archiver/releases/tag/1.3.0))

-   update [aws-sdk](https://www.npmjs.com/package/aws-sdk) to [2.107.0](https://github.com/aws/aws-sdk-js/releases/tag/v2.107.0) (from [2.67.0](https://github.com/aws/aws-sdk-js/releases/tag/v2.67.0))

-   update [boom](https://www.npmjs.com/package/boom) to 5.2.0 (from 5.1.0)

-   update [chalk](https://www.npmjs.com/package/chalk) to 2.1.0 (from 1.1.3)

-   update [cpr](https://www.npmjs.com/package/cpr) to [2.2.0](https://github.com/davglass/cpr/blob/master/CHANGELOG.md) (from [2.1.0](https://github.com/davglass/cpr/blob/master/CHANGELOG.md))

-   update [execa](https://www.npmjs.com/package/execa) to 0.8.0 (from 0.7.0)

-   update [glob](https://www.npmjs.com/package/glob) to 7.1.2 (from 7.1.1)

-   update [good](https://www.npmjs.com/package/good) to 7.3.0 (from 7.2.0)

-   update [hapi](https://www.npmjs.com/package/hapi) to 16.5.2 (from 16.4.3)

-   update [inquirer](https://www.npmjs.com/package/inquirer) to [3.2.3](https://github.com/SBoudrias/Inquirer.js/releases/tag/v3.2.3) (from [3.1.0](https://github.com/SBoudrias/Inquirer.js/releases/tag/v3.1.0))

-   update [js-yaml](https://www.npmjs.com/package/js-yaml) to [3.9.1](https://github.com/nodeca/js-yaml/blob/master/CHANGELOG.md) (from [3.8.4](https://github.com/nodeca/js-yaml/blob/master/CHANGELOG.md))

-   update [load-json-file](https://www.npmjs.com/package/load-json-file) to 3.0.0 (from 2.0.0)

-   update [log-symbols](https://www.npmjs.com/package/log-symbols) to 2.0.0 (from 1.0.2)

-   update [log-update](https://www.npmjs.com/package/log-update) to 2.1.0 (from 2.0.0)

-   update [semver](https://www.npmjs.com/package/semver) to 5.4.1 (from 5.3.0)

-   update [serverless](https://www.npmjs.com/package/serverless) to [1.21.0](https://github.com/serverless/serverless/blob/master/CHANGELOG.md) (from [1.15.2](https://github.com/serverless/serverless/blob/master/CHANGELOG.md))

-   update [write-json-file](https://www.npmjs.com/package/write-json-file) to 2.2.0 (from 2.1.0)

## 2.0.0 - 2017-06-13

### Migration Guide

-   [Migrating to `v2.x.x`](./docs/migrate-to-v2.x.md)

### Added

-   SC-71: `route` property to `request` argument passed to handlers. Will contain the original `route` property.
-   SC-71: analytics log message to wrapper to allow for metrics and analysis on routes
-   SC-72: `--bm-server-version` flag to `bm server serverless` command to allow for changing `serverless` configurations based on `bm server` version
-   API-10: usage documentation for `bm server serverless` command

### Changed

-   SC-64: Bumped minimum supported version Node version to `>=6`
-   SC-64: Execution environment from Node4.3 to Node6.10
-   SC-71: `bm server serverless` now creates one set of AWS resources (Lambda, API Gateway Endpoint and Log Group) for all routes in a project instead of one set for each route.

### Removed

-   SC-71: `/route` input from `bm server logs /route`. Logs will now be retrieved for all routes in the project.
-   SC-71: timeout override at the route level. All routes will now share the same timeout.

### Dependencies

-   update [@blinkmobile/bm-identity](https://www.npmjs.com/package/@blinkmobile/bm-identity) to [2.3.5](https://github.com/blinkmobile/bm-identity.js/releases/tag/2.3.5) (from [2.3.3](https://github.com/blinkmobile/bm-identity.js/releases/tag/2.3.3))

-   update [aws-sdk](https://www.npmjs.com/package/aws-sdk) to [2.67.0](https://github.com/aws/aws-sdk-js/releases/tag/v2.67.0) (from [2.28.0](https://github.com/aws/aws-sdk-js/releases/tag/v2.28.0))

-   update [boom](https://www.npmjs.com/package/boom) to 5.1.0 (from 4.2.0)

-   update [cpr](https://www.npmjs.com/package/cpr) to [2.1.0](https://github.com/davglass/cpr/blob/master/CHANGELOG.md) (from [2.0.2](https://github.com/davglass/cpr/blob/master/CHANGELOG.md))

-   update [execa](https://www.npmjs.com/package/execa) to 0.7.0 (from 0.6.1)

-   update [good](https://www.npmjs.com/package/good) to 7.2.0 (from [7.1.0](https://github.com/hapijs/good/releases/tag/v7.1.0))

-   update [hapi](https://www.npmjs.com/package/hapi) to 16.4.3 (from 16.1.0)

-   update [inquirer](https://www.npmjs.com/package/inquirer) to [3.1.0](https://github.com/SBoudrias/Inquirer.js/releases/tag/v3.1.0) (from [3.0.6](https://github.com/SBoudrias/Inquirer.js/releases/tag/v3.0.6))

-   update [js-yaml](https://www.npmjs.com/package/js-yaml) to [3.8.4](https://github.com/nodeca/js-yaml/blob/master/CHANGELOG.md) (from [3.8.2](https://github.com/nodeca/js-yaml/blob/master/CHANGELOG.md))

-   update [log-update](https://www.npmjs.com/package/log-update) to 2.0.0 (from 1.0.2)

-   update [pify](https://www.npmjs.com/package/pify) to [3.0.0](https://github.com/sindresorhus/pify/releases/tag/v3.0.0) (from 2.3.0)

-   update [serverless](https://www.npmjs.com/package/serverless) to [1.15.2](https://github.com/serverless/serverless/releases/tag/v1.15.2) (from [1.9.0](https://github.com/serverless/serverless/releases/tag/v1.9.0))

-   update [update-notifier](https://www.npmjs.com/package/update-notifier) to [2.2.0](https://github.com/yeoman/update-notifier/releases/tag/v2.2.0) (from 2.1.0)

-   update [write-json-file](https://www.npmjs.com/package/write-json-file) to 2.1.0 (from 2.0.0)

-   depend upon [semver](https://www.npmjs.com/package/semver) 5.3.0


## 1.0.0 - 2017-03-15

### Added

-   SC-55: timeout configuration for entire project (still defaults to 15 seconds), with an override at the route level

-   SC-57: added `bm server logs` command to view server logs

### Dependencies

-   update [aws-sdk](https://www.npmjs.com/package/aws-sdk) to [2.28.0](https://github.com/aws/aws-sdk-js/releases/tag/v2.28.0) (from [2.24.0](https://github.com/aws/aws-sdk-js/releases/tag/v2.24.0))

-   update [execa](https://www.npmjs.com/package/execa) to 0.6.1 (from 0.6.0)

-   update [js-yaml](https://www.npmjs.com/package/js-yaml) to [3.8.2](https://github.com/nodeca/js-yaml/blob/master/CHANGELOG.md) (from [3.8.1](https://github.com/nodeca/js-yaml/blob/master/CHANGELOG.md))

-   update [request](https://www.npmjs.com/package/request) to [2.81.0](https://github.com/request/request/blob/master/CHANGELOG.md) (from [2.80.0](https://github.com/request/request/blob/master/CHANGELOG.md))

-   depend upon [serverless](https://www.npmjs.com/package/serverless) [1.9.0](https://github.com/serverless/serverless/releases/tag/v1.9.0)


## 1.0.0-beta.6 - 2017-03-09

### Changed

-   SC-61: default timeout for all handlers from 6 seconds to 15 seconds

### Dependencies

-   update [@blinkmobile/bm-identity](https://www.npmjs.com/package/@blinkmobile/bm-identity) to [2.3.3](https://github.com/blinkmobile/bm-identity.js/releases/tag/2.3.3) (from [2.3.2](https://github.com/blinkmobile/bm-identity.js/releases/tag/2.3.2))

-   update [aws-sdk](https://www.npmjs.com/package/aws-sdk) to [2.24.0](https://github.com/aws/aws-sdk-js/releases/tag/v2.24.0) (from [2.19.0](https://github.com/aws/aws-sdk-js/releases/tag/v2.19.0))

-   update [inquirer](https://www.npmjs.com/package/inquirer) to [3.0.6](https://github.com/SBoudrias/Inquirer.js/releases/tag/v3.0.6) (from [3.0.5](https://github.com/SBoudrias/Inquirer.js/releases/tag/v3.0.5))

-   update [request](https://www.npmjs.com/package/request) to [2.80.0](https://github.com/request/request/blob/master/CHANGELOG.md) (from [2.79.0](https://github.com/request/request/blob/master/CHANGELOG.md))


## 1.0.0-beta.5 - 2017-02-28

### Dependencies

-   update [@blinkmobile/bm-identity](https://www.npmjs.com/package/@blinkmobile/bm-identity) to [2.3.2](https://github.com/blinkmobile/bm-identity.js/blob/master/CHANGELOG.md) (from [2.3.1](https://github.com/blinkmobile/bm-identity.js/blob/master/CHANGELOG.md))

-   update [inquirer](https://www.npmjs.com/package/inquirer) to 3.0.5 (from 3.0.3)


## 1.0.0-beta.4 - 2017-02-27

### Added

-   SC-58: multiple replaceable parameters for single route

### Dependencies

-   update [aws-sdk](https://www.npmjs.com/package/aws-sdk) to [2.19.0](https://github.com/aws/aws-sdk-js/releases/tag/v2.19.0) (from [2.7.27](https://github.com/aws/aws-sdk-js/releases/tag/v2.7.27))

-   update [good-console](https://www.npmjs.com/package/good-console) to 6.4.0 (from 6.2.0)

-   update [inquirer](https://www.npmjs.com/package/inquirer) to [3.0.3](https://github.com/SBoudrias/Inquirer.js/releases/tag/v3.0.3) (from [3.0.1](https://github.com/SBoudrias/Inquirer.js/releases/tag/v3.0.1))

-   update [js-yaml](https://www.npmjs.com/package/js-yaml) to [3.8.1](https://github.com/nodeca/js-yaml/blob/master/CHANGELOG.md) (from [3.7.0](https://github.com/nodeca/js-yaml/blob/master/CHANGELOG.md))

-   update [update-notifier](https://www.npmjs.com/package/update-notifier) to 2.1.0 (from [1.0.3](https://github.com/yeoman/update-notifier/releases/tag/v1.0.3))


## 1.0.0-beta.3 - 2017-02-06


### Added

-   SC-51: `bm server serverless --vpc-security-groups --vpc-subnets` flags to specify Virtual Private Cloud configuration


### Dependencies

-   update [@blinkmobile/bm-identity](https://www.npmjs.com/package/@blinkmobile/bm-identity) to [2.3.1](https://github.com/blinkmobile/bm-identity.js/releases/tag/2.3.1) (from [2.3.0](https://github.com/blinkmobile/bm-identity.js/releases/tag/2.3.0))

-   update [aws-sdk](https://www.npmjs.com/package/aws-sdk) to [2.7.27](https://github.com/aws/aws-sdk-js/releases/tag/v2.7.27) (from [2.7.21](https://github.com/aws/aws-sdk-js/releases/tag/v2.7.21))

-   update [inquirer](https://www.npmjs.com/package/inquirer) to [3.0.1](https://github.com/SBoudrias/Inquirer.js/releases/tag/v3.0.1) (from [2.0.0](https://github.com/SBoudrias/Inquirer.js/releases/tag/v2.0.0))


## 1.0.0-beta.2 - 2017-01-11


### Added

-   SC-46: `bm server serverless --deployment-bucket` flag to specify a custom AWS S3 bucket for deployment

-   SC-46: `bm server serverless --execution-role` flag to specify a custom AWS IAM role ARN during function execution


### Fixed

-   SC-45: root route "/" has content instead of authorisation error


### Changed

-   SC-49: Changed methods from `DELETE`, `GET`, `OPTIONS`, `PATCH`, `POST` and `PUT`  to `ANY` when creating Serverless projects


## 1.0.0-beta.1 - 2016-12-19


### Changed

-   Example project names to be more realistic

-   **BREAKING CHANGE**: `--stage` flag to `--env`, functionality has not changed.

-   **BREAKING CHANGE**: `<project_path>` input option to a `--cwd` flag for all CLI commands

-   **BREAKING CHANGE**: `bm server scope --project <project>` now sets project using `bm server scope <project>`
