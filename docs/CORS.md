# blinkmobile / server-cli

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
  "server": {
    "cors": false
  }
}
```

By setting cors to `true`, defaults below will be used.

```json
{
  "server": {
    "cors": true
  }
}
```

**Note:** If any properties are omitted, they will default to the example below.

```json
{
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
