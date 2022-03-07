# cstar-integration-test

A collection of integration tests for the CentroStella infrastructure.

## Tests layout

```
test
    ├── common       <-- building blocks (API method, checks, ...)
    │   └── api
    ├── e2e          <-- end-to-end tests
    │   └── uat
    ├── performance  <-- load tests
    │   └── dev
    └── smoke        <-- smoke tests
        ├── dev
        ├── prod
        └── uat
```

## Installation

1. Install `go` (on Mac OS X `brew install golang`)
2. Install `xk6` with the following command `go install go.k6.io/xk6/cmd/xk6@latest`
3. Build a customized version of `k6` with `dotenv` support. The following command will create e customized `k6` executable in the current folder `xk6 build --with github.com/szkiba/xk6-dotenv@latest`

## Usage

1. Create a folder named `certs`
2. Put the private key and the corresponding certificate for mutual-auth in the folder `certs`
3. Create a copy of the file `./env.local.sample` and rename it as `./.env.dev.local` [`./.env.uat.local` | `./.env.prod.local`]
4. Customize env variables in `./.env.dev.local` [`./.env.uat.local` | `./.env.prod.local`]
5. Run a test with `TARGET_ENV=<ENV> ./k6 run test/smoke/rtdCsvTransaction.js`

### Perform the whole suite of smoke tests on a target environment

```
./smoke_env.sh <ENV>
```

### Enable HTTP tracing

With tracing enabled all HTTP responses will be printed to standard output.
To enable it just set the environment variable *REQ_DUMP*:

```sh
REQ_DUMP=1 ./k6 run <TEST>
```
