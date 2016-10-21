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
  info                    => displays project information
  scope                   => displays the current scope
    --project <project>   => sets the project id
    --region <region>     => optionally sets the region
```

## CORS Configuration

[Cross-Origin Resource Sharing](https://www.w3.org/TR/cors/) protocol allows browsers to make cross-origin API calls.
CORS is required by web applications running inside a browser which are loaded from a different domain than the API server.

CORS can be configured in a `json` file that is pointed at from `package.json:main` in the root of your project directory e.g.

### Directory Structure

```
|-- project-root
|   |-- bm-server.json
|   |-- package.json
|   |-- helloworld
|   |   |-- index.js
```

### package.json

```json
{
  "name": "example",
  "version": "0.0.1",
  "main": "bm-server.json",
}
```

### bm-server.json

```json
{
  "cors": {
    "origins": [
      "http://your.first.client",
      "http://your.second.client",
      "http://your.third.client"
    ],
    "headers": [
      "Accept",
      "Authorization",
      "Content-Type",
      "If-None-Match",
      "X-Amz-Date",
      "X-Amz-Security-Token",
      "X-Api-Key"
    ]
  }
}
```

### Allowed Headers

Headers can be omitted and will default to the headers in the example above.
