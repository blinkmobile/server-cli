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

## CORS Configuration

[Cross-Origin Resource Sharing](https://www.w3.org/TR/cors/) protocol allows browsers to make cross-origin API calls.
CORS is required by web applications running inside a browser which are loaded from a different domain than the API server.

CORS can be configured in a `.blinkmrc.json` file that is in the root of your project directory e.g.

### Directory Structure

```
|-- project-root
|   |-- .blinkmrc.json
|   |-- helloworld
|   |   |-- index.js
```

### .blinkmrc.json

By setting cors to `false`, Cross-Origin resource sharing will not be allowed. **This is the default behaviour**

```json
{
  "project": "project-id",
  "server": {
    "cors": false
  }
}
```

By setting cors to `true`, defaults below will be used.

```json
{
  "project": "project-id",
  "server": {
    "cors": true
  }
}
```

**Note:** If any properties are omitted, they will default to the example below.

```json
{
  "project": "project-id",
  "server": {
    "cors": {
      "origins": [
        "*"
      ],
      "headers": [
        "Accept",
        "Authorization",
        "Content-Type",
        "If-None-Match",
        "X-Amz-Date",
        "X-Amz-Security-Token",
        "X-Api-Key"
      ],
      "exposedHeaders": [
        "Server-Authorization",
        "WWW-Authenticate"
      ],
      "credentials": false,
      "maxAge": 86400 // in seconds = 1 day
    }
  }
}
```
