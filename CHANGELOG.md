# Change Log

## Unreleased

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
