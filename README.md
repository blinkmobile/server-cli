# blinkmobile / server-cli [![npm](https://img.shields.io/npm/v/@blinkmobile/server-cli.svg?maxAge=2592000)](https://www.npmjs.com/package/@blinkmobile/server-cli) [![AppVeyor Status](https://ci.appveyor.com/api/projects/status/github/blinkmobile/server-cli?branch=master&svg=true)](https://ci.appveyor.com/project/blinkmobile/server-cli) [![Travis CI Status](https://travis-ci.org/blinkmobile/server-cli.svg?branch=master)](https://travis-ci.org/blinkmobile/server-cli) [![Greenkeeper badge](https://badges.greenkeeper.io/blinkmobile/server-cli.svg)](https://greenkeeper.io/)

CLI to develop, test and deploy server-side HTTPS endpoints with BlinkMobile


## Installation

```
npm install -g @blinkmobile/cli @blinkmobile/identity-cli @blinkmobile/server-cli
```

## Documentation

See the [Documentation](./docs/README.md) directory for more details.

## Usage

```sh
blinkm server --help

# or, shorter
bm server --help
```

```
Usage: blinkm server <command>

Where command is one of:

  info, serve, scope, deploy, logs, serverless

Local development:

  info                        => displays project information
    --cwd <path>              => optionally set the path to project, defaults to current working directory
  serve                       => start a local development server using local API files
    --port <port>             => sets the port to use for server, defaults to 3000
    --cwd <path>              => optionally set the path to project, defaults to current working directory

Initial settings:

  scope                       => displays the current scope
    <project>                 => sets the project id
    --region <region>         => optionally sets the region
    --cwd <path>              => optionally set the path to project, defaults to current working directory

Deploying server side code:

  The deploy command requires a login to BlinkMobile before use.
  For help on the login and logout commands please see:
  https://github.com/blinkmobile/identity-cli#usage

  deploy                      => deploy the project
    --force                   => deploy without confirmation
    --env <environment>       => optionally sets the environment to deploy to, defaults to 'dev'
    --cwd <path>              => optionally set the path to project, defaults to current working directory

Viewing server logs:

  logs                        => view logs for project
    --tail                    => keep listening for new logs in your terminal session
    --filter <filterPattern>  => optionally set a search filter, defaults to all logs
    --start-time <startTime>  => a unit in time to start fetching logs from (ie: 2010-10-20 or 1469705761), defaults to all logs
    --env <environment>       => optionally set the environment to view logs for, defaults to 'dev'
    --cwd <path>              => optionally set the path to project, defaults to current working directory

Create serverless project:

  serverless                            => create serverless project
    --deployment-bucket <bucket>        => set the deployment S3 bucket
    --execution-role <role>             => set the execution IAM Role ARN
    --vpc-security-groups <groups>      => comma separated list of VPC Security Group identifiers
    --vpc-subnets <subnets>             => comma separated list of VPC Subnet identifiers
    --bm-server-version <version>       => server version of @blinkmobile/sever-cli that the project was created with
    --env <environment>                 => optionally set the environment, defaults to 'dev'
    --cwd <path>                        => optionally set the path to project, defaults to current working directory
    --analytics-collector-token <token> => optionally add an analytics collector token
    --analytics-origin <origin>         => optionally add an analytics origin
```
