import { group } from 'k6'
import { putBlob } from '../common/api/rtdStorage.js'
import { assert, statusCreated } from '../common/assertions.js'
import {
    isEnvValid,
    isTestEnabledOnEnv,
    DEV,
    UAT,
    PROD,
} from '../common/envs.js'
import dotenv from 'k6/x/dotenv'

const REGISTERED_ENVS = [DEV, UAT, PROD]

const services = JSON.parse(open('../../services/environments.json'))
const BLOB_PREFIX = 'CSTAR.K6000.TRNLOG.'
const BLOB_SUFFIX = '.001.csv.pgp'
export let options = {}
let params = {}
let baseUrl
let myEnv
let payload

if (isEnvValid(__ENV.TARGET_ENV)) {
    myEnv = dotenv.parse(open(`../../.env.${__ENV.TARGET_ENV}.local`))
    baseUrl = services[`${__ENV.TARGET_ENV}_issuer`].baseUrl

    options.tlsAuth = [
        {
            domains: [baseUrl],
            cert: open(`../../certs/${myEnv.MAUTH_CERT_NAME}`),
            key: open(`../../certs/${myEnv.MAUTH_PRIVATE_KEY_NAME}`),
        },
    ]

    params.headers = {
        'Ocp-Apim-Subscription-Key': myEnv.APIM_RTDPRODUCT_SK,
        'Ocp-Apim-Trace': 'true',
    }

    payload = open(`../../assets/trx-list-input.csv.pgp`, 'b')
}

export default () => {
    if (
        !isEnvValid(__ENV.TARGET_ENV) ||
        !isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS) ||
        !myEnv.RTD_STORAGE_CONTAINER
    ) {
        return
    }

    const blobDateTimePart = new Date()
        .toISOString()
        .replace('T', '.')
        .replace('-', '')
        .replace('-', '')
        .replace(':', '')
        .replace(':', '')
        .substring(0, 15)
    const blob = BLOB_PREFIX + blobDateTimePart + BLOB_SUFFIX

    group('Storage API', () => {
        group('Should upload file via PUT', () =>
            assert(
                putBlob(
                    baseUrl,
                    params,
                    myEnv.RTD_STORAGE_CONTAINER,
                    blob,
                    payload,
                    myEnv.RTD_STORAGE_SAS
                ),
                [statusCreated()]
            )
        )
    })
}
