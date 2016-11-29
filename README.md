# blinkmobile / server-cli [![npm](https://img.shields.io/npm/v/@blinkmobile/server-cli.svg?maxAge=2592000)](https://www.npmjs.com/package/@blinkmobile/server-cli) [![AppVeyor Status](https://ci.appveyor.com/api/projects/status/github/blinkmobile/server-cli?branch=master&svg=true)](https://ci.appveyor.com/project/blinkmobile/server-cli) [![Travis CI Status](https://travis-ci.org/blinkmobile/server-cli.svg?branch=master)](https://travis-ci.org/blinkmobile/server-cli)

CLI to develop, test and deploy server-side HTTPS endpoints with BlinkMobile


## Installation

Not yet published to NPM. Watch this space!


## Usage

```
blinkm server --help

# or, shorter
bm server --help
```

```
Usage: blinkm server <command> <project_path>

Where command is one of:

  info, serve, scope, deploy

And project_path is path to project directory, defaults to current working directory

Local development:

  info                    => displays project information
  serve                   => start a local development server using local API files
    --port <port>         => sets the port to use for server

Initial settings:

  scope                   => displays the current scope
    --project <project>   => sets the project id
    --region <region>     => optionally sets the region

Deploying server side code:

  The deploy command requires a login to BlinkMobile before use.
  For help on the login and logout commands please see:
  https://github.com/blinkmobile/identity-cli#usage

  deploy                  => deploy the project
    --force               => deploy without confirmation
```


## Documentation

See the [docs](./docs) directory for more details.
