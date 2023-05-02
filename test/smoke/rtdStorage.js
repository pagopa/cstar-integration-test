import { group } from 'k6'
import { putBlob } from '../common/api/rtdStorage.js'
import { assert, statusCreated, statusBadFormat } from '../common/assertions.js'
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
const BLOB_WRONG_NAME = 'foo.bar.pgp'
const BLOB_PREFIX_WITH_PATH = 'foo/bar/CSTAR.12345.TRNLOG.'
const BLOB_PREFIX = 'CSTAR.12345.TRNLOG.'
const BLOB_SUFFIX = '.001.01.csv.pgp'
const BLOB_WRONG_SUFFIX = '.csv'
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
    const blobCorrect = BLOB_PREFIX + blobDateTimePart + BLOB_SUFFIX
    const blobNameWithPath = BLOB_PREFIX_WITH_PATH + blobDateTimePart + BLOB_SUFFIX
    const blobWrongNaming = BLOB_WRONG_NAME + blobDateTimePart + BLOB_SUFFIX
    const blobWrongSuffix = BLOB_PREFIX + blobDateTimePart + BLOB_WRONG_SUFFIX

    group('Storage API', () => {
        group('Should upload file via PUT', () =>
            assert(
                putBlob(
                    baseUrl,
                    params,
                    myEnv.RTD_STORAGE_CONTAINER,
                    blobCorrect,
                    payload,
                    myEnv.RTD_STORAGE_SAS
                ),
                [statusCreated()]
            )
        ),
        group('Should fail upload file via PUT for wrong naming', () =>
            assert(
                putBlob(
                    baseUrl,
                    params,
                    myEnv.RTD_STORAGE_CONTAINER,
                    blobWrongNaming,
                    payload,
                    myEnv.RTD_STORAGE_SAS
                ),
                [statusBadFormat()]
            )
        ),
        group('Should fail upload file via PUT for path included in naming', () =>
            assert(
                putBlob(
                    baseUrl,
                    params,
                    myEnv.RTD_STORAGE_CONTAINER,
                    blobNameWithPath,
                    payload,
                    myEnv.RTD_STORAGE_SAS
                ),
                [statusBadFormat()]
            )
        ),
        group('Should fail upload file via PUT for wrong suffix', () =>
            assert(
                putBlob(
                    baseUrl,
                    params,
                    myEnv.RTD_STORAGE_CONTAINER,
                    blobWrongSuffix,
                    payload,
                    myEnv.RTD_STORAGE_SAS
                ),
                [statusBadFormat()]
            )
        )
    })
}
