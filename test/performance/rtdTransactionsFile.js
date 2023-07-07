import { group } from 'k6'
import { createRtdSas, putPgpFile } from '../common/api/rtdCsvTransaction.js'
import { assert, statusCreated } from '../common/assertions.js'
import {
    isEnvValid,
    isTestEnabledOnEnv,
    DEV,
    UAT,
    PROD,
} from '../common/envs.js'
import { exec } from 'k6/execution'
import {
    jUnit,
    textSummary,
} from 'https://jslib.k6.io/k6-summary/0.0.2/index.js'
import defaultHandleSummaryBuilder from '../common/handleSummaryBuilder.js'

const REGISTERED_ENVS = [DEV, UAT, PROD]

const services = JSON.parse(open('../../services/environments.json'))

let params = {}
let param = {}
let baseUrl
let myEnv
let sas
let authorizedContainer
let gpgFile

let fileName = __ENV.TRX_FILE_NAME

export let options = {
    scenarios: {
        perVuIterations: {
            executor: 'per-vu-iterations',
            vus: 1,
            iterations: 1,
            startTime: '0s',
            maxDuration: `${__ENV.DURATION_PER_VU_ITERATION}s`,
        },
    },
    thresholds: {
        http_req_failed: [
            {
                threshold: 'rate<0.01',
                abortOnFail: false,
                delayAbortEval: '10s',
            },
        ], // http errors should be less than 1%
        http_reqs: [
            {
                threshold: 'count<=2',
                abortOnFail: false,
                delayAbortEval: '10s',
            },
        ],
    },
}

if (isEnvValid(__ENV.TARGET_ENV)) {
    baseUrl = services[`${__ENV.TARGET_ENV}_issuer`].baseUrl
    gpgFile = open(`../../assets/${fileName}`, 'b')

    options.tlsAuth = [
        {
            domains: [baseUrl],
            cert: open(`../../certs/rtd-acquirer-mauth.pem`),
            key: open(`../../certs/rtd-acquirer-mauth.key`),
        },
    ]

    params.headers = {
        'Ocp-Apim-Trace': 'true',
        'Ocp-Apim-Subscription-Key': __ENV.APIM_SK,
    }

    param.headers = {
        'Ocp-Apim-Subscription-Key': __ENV.APIM_SK,
        'x-ms-blob-type': 'BlockBlob',
        'x-ms-version': '2020-12-06',
        'Content-Type': 'text/csv',
    }
}

export default () => {
    if (
        !isEnvValid(__ENV.TARGET_ENV) ||
        !isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)
    ) {
        exec.test.abort()
    }

    group('CSV Transaction API', () => {
        const res = createRtdSas(baseUrl, params)

        assert(res, [statusCreated()])

        if (res.status == 201) {
            const bodyObj = JSON.parse(res.body)
            sas = bodyObj.sas
            authorizedContainer = bodyObj.authorizedContainer
        } else {
            console.error('Get Token SAS -> ' + JSON.stringify(res))
            return
        }

        group('Should put file pgp', () => {
            const rest = putPgpFile(
                baseUrl,
                gpgFile,
                param,
                authorizedContainer,
                fileName,
                sas
            )

            assert(rest, [statusCreated()])
            if (rest.status != 201) {
                console.error('Put pgp file -> ' + JSON.stringify(rest))
            }
        })
    })
}

export const handleSummary = defaultHandleSummaryBuilder(
    'rtd',
    'rtdTransactionsFile'
)
