# Migrating to `v2.x.x` from `v1.x.x`

Version `2.x.x` contained a number of breaking changes and will need to be handled before using the Server CLI to deploy server-side HTTPS endpoints again.

## Node Version Support

### `v1.x.x`

Only Node `4.3.x` was supported in the execution environment.

### `v2.x.x`

NodeJS `6.10.x` will now be the only version of node supported in the execution environment.

See [Breaking changes between v4 LTS and v6 LTS](https://github.com/nodejs/wiki-archive/blob/master/Breaking-changes-between-v4-LTS-and-v6-LTS.md) for more information on breaking changes.

## Route Timeouts

### `v1.x.x`

A single timeout could be set at the project level and overridden on each individual route if required:

```json
{
  "server": {
    "project": "bm-example.api.blinkm.io",
    "region": "ap-southeast-2",
    "cors": true,
    "timeout": 10,
    "routes": [
      {
        "route": "/helloworld",
        "module": "./request/index.js",
        "timeout": 5
      },
      {
        "route": "/test",
        "module": "./test/index.js"
      }
    ]
  }
}
```

### `v2.x.x`

Timeouts can now only be set at the project level. **There is no longer an option to override the project level value (currently defaulting to 15 seconds if unset)**. We recommend setting the project level timeout to the maximum timeout required for each route:

```json
{
  "server": {
    "project": "bm-example.api.blinkm.io",
    "region": "ap-southeast-2",
    "cors": true,
    "timeout": 10,
    "routes": [
      {
        "route": "/helloworld",
        "module": "./request/index.js"
      },
      {
        "route": "/test",
        "module": "./test/index.js"
      }
    ]
  }
}
```

## Viewing Logs

### `v1.x.x`

Logs could only be viewed for a single route at a time:

```
bm server logs /helloworld
```

### `v2.x.x`

Logs can now **only** be viewed for the entire project:

```
bm server logs
```

All existing flags still exist and their functionality has not changed.

