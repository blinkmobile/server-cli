# blinkmobile / server-cli

## Server CLI Service

The Server CLI Service deploys Server CLI projects to [AWS Lambda](https://aws.amazon.com/lambda/details/).

### Configuration

These values will most likely only be changed for testing purposes.

The HTTP origin and AWS S3 Bucket that are used to access the Server CLI Service can be configured in `.blinkmrc.json`:

```json
{
  "server": {
    "service": {
      "bucket": "server-cli-service-bundles-multitenant",
      "origin": "https://auth-api.blinkm.io"
    }
  }
}
```
