# cstar-integration-test
Test rely on the following modules

- dotenv (see instruction here https://github.com/szkiba/xk6-dotenv)

Please intall them before running any test suite.

## Using Provided Tests to Check Mutual Authentication in Prod [UAT]

1. Install `go`
2. Clone this repository and move in the root folder
3. Create a folder named `certs`
4. Put the private key and the corresponding certificate for mutual-auth in the folder `certs`
5. Check that the certificate is signed by CA PAGOPA 05 [CA PAGOPA 04]
6. Install `xk6`, which is a tool for building customized versione of `k6` executable, with the following command
```go install go.k6.io/xk6/cmd/xk6@latest```
7. Build a customized version of `k6` with `dotenv` support. The following command will create e customized `k6` executable in the current folder
```$ xk6 build --with github.com/szkiba/xk6-dotenv@latest```
8. Create a copy of the file `./test/e2e/prod/env.production.local.sample` [`./test/e2e/uat/env.test.local.sample`] and rename it as `./test/e2e/prod/.env.production.local` [`./test/e2e/uat/.env.test.local`]
9. Customize env variables in `./test/e2e/prod/.env.production.local` [`./test/e2e/uat/.env.test.local`]
10. Run the following test in prod [uat]
```./k6  run test/e2e/prod/bpdHbAwardPeriod.js [./k6  run test/e2e/uat/bpdHbAwardPeriod.js]```
