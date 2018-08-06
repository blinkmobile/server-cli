# blinkmobile / server-cli

## Local Development

Once you have written your handlers and setup the required routes, you are able to serve you code locally using the CLI `serve` command.

### `serve` Command

```bash
bm server serve
```

#### Options

-   `--env`: optionally sets the environment to load environment variables from, defaults to `dev`. See [Environment Variables](./environment-variables.md) for more information.
-   `--port`: optionally sets the port to use for server, defaults to `3000`.
-   `--cwd`: optionally set the path to project, defaults to current working directory.

#### Examples

-   Serve routes and handlers using `test` environment variables on port `2000`:

    ```bash
    bm server serve --env test --port 2000
    ```
