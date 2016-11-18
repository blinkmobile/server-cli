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

Commands:
  serve                   => start a local development server using local API files
    --port <port>         => sets the port to use for server
  info                    => displays project information
  scope                   => displays the current scope
    --project <project>   => sets the project id
    --region <region>     => optionally sets the region
  deploy                  => deploy the project
    --force               => deploy without confirmation
    --stage <stage>       => optionally sets the stage to deploy to, defaults to 'test'
```


## Documentation

See the [docs](./docs) directory for more details.
