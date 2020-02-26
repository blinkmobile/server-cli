# blinkmobile / server-cli

## Tenant Configuration

A tenant can be set in the `.blinkmrc.json` file that is in the root of your project directory e.g.

### Directory Structure

```
|-- project-root
|   |-- .blinkmrc.json
|   |-- helloworld
|   |   |-- index.js
```

### .blinkmrc.json

By setting `tenant` to `oneblink` or `civicplus`, you will be accessing the respective versions of the server-cli architecture. This property should be set to the applicable option.

```json
{
  "server": {
    "tenant": "oneblink" | "civicplus"
  }
}
```
