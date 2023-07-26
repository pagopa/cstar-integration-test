# cstar-integration-test

A collection of integration tests for the CentroStella infrastructure.
For IDPay domain, see [Confluece page](https://pagopa.atlassian.net/wiki/spaces/IDPAY/pages/612466897/PerformanceTests)

## Tests layout

```
test
    ├── common       <-- building blocks (API method, checks, ...)
    │   └── api
    ├── e2e          <-- end-to-end tests
    ├── performance  <-- load tests
    └── smoke        <-- smoke tests
```

## Installation

1. Install `go` (on Mac OS X `brew install golang`)
2. Install `xk6` with the following command `go install go.k6.io/xk6/cmd/xk6@latest`
3. Build a customized version of `k6` with `dotenv` support. The following command will create e customized `k6` executable in the current folder `xk6 build --with github.com/szkiba/xk6-dotenv@latest`. Warning: if you are using an arm architecture you may need to specify the k6 version to guarantee all the tests to run smoothly: `xk6 build v0.34.0 --with github.com/szkiba/xk6-dotenv@latest`.

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

### Perform the whole suite of load tests on a target environment

```
./load_env.sh <ENV>
```

### Enable HTTP tracing

With tracing enabled all HTTP responses will be printed to standard output.
To enable it just set the environment variable _REQ_DUMP_:

```sh
REQ_DUMP=1 ./k6 run <TEST>
```

## Configuration

### Dynamic scenarios

K6 allows to configure tests having a different [workloads](https://k6.io/docs/using-k6/scenarios/), or traffic patterns.
Some tests inside this repo allow its dynamic configuration through environment variable.

#### Scenarios

All dynamic scenarios' tests as default will be executed simulating the following workloads:

-   perVuIterations: a workloads having a fixed number of executions performed by a fixed number of users.
    -   This scenario could be further configured to be run multiple times until consume all the provided test data (setting SCENARIO_PER_VU_SINGLE_ITERATION_ENV to false)
-   rampingArrivalRate: a workloads having a variable number of parallel users which will run as many executions as allowed by the execution unit configured. Each variation of the number of users represent a stage. In this scenario. As default it will configure 3 stage (the minimum number) running a random number of parallel users at each stage (the last stage will always be 0, in order to wait previous stage executions).
-   rampingGrowingArrivalRate: As previous scenario, but here it will be possible to configure a pool of virtual users, used to draw a growing ramp, maximizing the number of the parallel vu at the latest stages. As default it will configure 3 stage (the minimum number):
    1. Starting from 0, it will grow the number of users in order to reach the maximum number of users
    2. Next it will mantain constant the number of parallel users
    3. Finally it will reduce the number of users until reach 0
-   constantArrivalRate: a workloads having a fixed number of concurrent http requests: it will perform as many iterations as necessary to mantain the configured rate.

#### Configuration

The following environment variables allow to configure dynamic scenarios' tests behaviors:

| ENV                                  | Description                                                                                                                   | Default |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ------- |
| TARGET_ENV                           | The environment to test                                                                                                       |         |
| RESULTS_DIR                          | The directory inside which create the results dir                                                                             | .       |
| REQ_DUMP                             | A boolen to log all requests or not                                                                                           | false   |
| VUS_MAX_ENV                          | The maximum number of parallel users to simulate                                                                              | 20       |
| MAX_AVAILABLE_TEST_ENTITIES_ENV      | The maximum number of external provided test data to use (if any and if required by implemented test)                         | 3       |
| SCENARIO_TYPE_ENV                    | The comma separated names of the scenarios to execute. Use the keys listed in [Scenarios](#scenarios) paragraph               | ALL     |
| SCENARIO_PER_VU_SINGLE_ITERATION_ENV | perVuIterations scenario: if run a single iteration or multiple consecutive until consume all MAX_AVAILABLE_TEST_ENTITIES_ENV | false   |
| SCENARIO_PER_VU_EXECUTIONS_ENV       | perVuIterations scenario: the number of executions which each user will perform                                               | 1       |
| SCENARIO_DURATION_ENV                | perVuIterations,constantArrivalRate scenario: Duration in seconds of the scenario                                             | 10      |
| SCENARIO_TIME_UNIT_ENV               | constantArrivalRate, rampingArrivalRate scenario: scenario time unit in seconds                                               | 1       |
| SCENARIO_RAMP_STAGE_NUMBER_ENV       | rampingArrivalRate scenario: the number of stages of the ramp                                                                 | 3       |
| THRESHOLDS_API_MAX_AVG_MS_ENV        | Max AVG duration applied as default to single API tests                                                                       | 500     |
| THRESHOLDS_API_MAX_P90_MS_ENV        | Max P90 duration applied as default to single API tests                                                                       | 800     |
| THRESHOLDS_API_MAX_P95_MS_ENV        | Max P95 duration applied as default to single API tests                                                                       | 1000    |

#### Implement dynamic scenarios' test

A test implementing a dynamic scenarios is structured as follow:

```javascript
import {
    createTransaction,
    preAuth,
    authTrx,
    PAYMENT_API_NAMES,
} from '../../common/api/idpay/idPayPaymentDiscount.js'
import { assert, statusCreated, statusOk } from '../../common/assertions.js'
import { DEV, UAT, getBaseUrl } from '../../common/envs.js'
import { getFCList } from '../../common/utils.js'
import { SharedArray } from 'k6/data'
import defaultHandleSummaryBuilder from '../../common/handleSummaryBuilder.js'
import {
    IDPAY_CONFIG,
    buildIOAuthorizationHeader,
    idpayDefaultHeaders,
} from '../../common/idpay/envVars.js'
import { defaultApiOptionsBuilder } from '../../common/dynamicScenarios/defaultOptions.js'
import {
    getScenarioTestEntity,
    logErrorResult,
} from '../../common/dynamicScenarios/utils.js'

// Environments allowed to be tested
const REGISTERED_ENVS = [DEV, UAT]
const baseUrl = getBaseUrl(REGISTERED_ENVS, 'io') // api-io services baseUrl

// test tags
const application = 'idpay'
const testName = 'idpayPaymentDiscountAPI'

// Set up data for processing, share data among VUs
let cfList = new SharedArray('cfList', getFCList)

// Dynamic scenarios' K6 configuration
export const options = defaultApiOptionsBuilder(
    application,
    testName,
    Object.values(PAYMENT_API_NAMES), // applying apiName tags to thresholds (usefull if the test is composed of more than 1 API to invoke)
    250, // configuring specific http request duration thresholds
    250,
    250
)

// K6 summary configuration
export const handleSummary = defaultHandleSummaryBuilder(application, testName)

export default () => {
    let checked = true
    let trxCode

    // selecting current scenario/iteration test entity
    const cf = getScenarioTestEntity(cfList).FC
    const citizenParams = { headers: buildIOAuthorizationHeader(cf) }

    // API invocation, each tagged with proper PAYMENT_API_NAMES name
}
```

## Contributing

Ensure your code is formatted correctly. The codestyle is defined in the file _.prettierrc_ and enforced via Prettier itself.

To automatically check (and eventually format) files before committing install the pre-commit hooks on your machine:

```
pre-commit Installation
```
