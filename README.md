# blinkmobile / server-cli [![npm](https://img.shields.io/npm/v/@blinkmobile/server-cli.svg?maxAge=2592000)](https://www.npmjs.com/package/@blinkmobile/server-cli) [![AppVeyor Status](https://ci.appveyor.com/api/projects/status/github/blinkmobile/server-cli?branch=master&svg=true)](https://ci.appveyor.com/project/blinkmobile/server-cli) [![Travis CI Status](https://travis-ci.org/blinkmobile/server-cli.svg?branch=master)](https://travis-ci.org/blinkmobile/server-cli) [![Greenkeeper badge](https://badges.greenkeeper.io/blinkmobile/server-cli.svg)](https://greenkeeper.io/)

CLI to develop, test and deploy server-side HTTPS endpoints with BlinkMobile


## Installation

```
npm install -g @blinkmobile/cli @blinkmobile/identity-cli @blinkmobile/server-cli
```


## Usage

```
blinkm server --help

# or, shorter
bm server --help
```

```
Usage: blinkm server <command>

Where command is one of:

  info, serve, scope, deploy

Local development:

  info                    => displays project information
    --cwd <path>          => optionally set the path to project, defaults to current working directory
  serve                   => start a local development server using local API files
    --port <port>         => sets the port to use for server, defaults to 3000
    --cwd <path>          => optionally set the path to project, defaults to current working directory

Initial settings:

  scope                   => displays the current scope
    <project>             => sets the project id
    --region <region>     => optionally sets the region
    --cwd <path>          => optionally set the path to project, defaults to current working directory

Deploying server side code:

  The deploy command requires a login to BlinkMobile before use.
  For help on the login and logout commands please see:
  https://github.com/blinkmobile/identity-cli#usage

  deploy                  => deploy the project
    --force               => deploy without confirmation
    --env <environment>   => optionally sets the environment to deploy to, defaults to 'dev'
    --cwd <path>          => optionally set the path to project, defaults to current working directory
```


## Documentation

See the [docs](./docs) directory for more details.
