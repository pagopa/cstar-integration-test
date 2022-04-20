import { group } from 'k6'
import exec from 'k6/execution'
import {
    getContractListByShopId,
    putMerchantByOther,
} from '../common/api/faExtMerchant.js'
import { assert, statusOk } from '../common/assertions.js'
import { isEnvValid, isTestEnabledOnEnv, DEV, UAT } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'
import { randomVatNumber } from '../common/utils.js'

const REGISTERED_ENVS = [DEV, UAT]

const services = JSON.parse(open('../../services/environments.json'))

export let options = {
    scenarios: {
        constant_request_rate: {
            executor: 'constant-arrival-rate',
            rate: 1,
            timeUnit: '1s',
            duration: '1m',
            preAllocatedVUs: 100,
            maxVUs: 10000,
        },
    },
    summaryTrendStats: [
        'med',
        'avg',
        'min',
        'max',
        'p(10)',
        'p(20)',
        'p(30)',
        'p(40)',
        'p(50)',
        'p(60)',
        'p(70)',
        'p(80)',
        'p(90)',
    ],
}

let params = {}
let baseUrl
let myEnv

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
        'Ocp-Apim-Subscription-Key': myEnv.APIM_SK,
        'Ocp-Apim-Trace': 'true',
        'Content-Type': 'application/json',
    }
}

// In performance tests we shall use abort() to prevent the execution
// of the default function, otherwise the VUs will be spawned
if (!isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)) {
    console.log('Test not enabled for target env')
    exec.test.abort()
}

function createBody() {
    return {
        vatNumber: randomVatNumber(),
        companyName: 'Company test',
        registerAuth: 'register_4',
        registerCode: '00004',
        shops: [
            {
                callId: 1,
                companyAddress: 'Test address 1',
                companyName: 'Test name 1',
                contactEmail: 'test.1@test.test',
                contactName: 'Contact name 1',
                contactSurname: 'Contact surname 1',
                contactTel1: '+39420000000001',
                providerId: 1,
            },
        ],
    }
}

function extractShopIdFromResponse(response) {
    if (response.status === 200 && response.body && response.body !== '') {
        const resBody = JSON.parse(response.body)
        if (resBody.shops && resBody.shops.length > 0) {
            return resBody.shops[0].shopId
        }
    }
    return ''
}

export default () => {
    group('FA EXT Merchant API', () => {
        const body = createBody()
        let shopId = ''
        group('Should put a merchant', () => {
            const res = putMerchantByOther(baseUrl, params, body)
            assert(res, [statusOk()])
            shopId = extractShopIdFromResponse(res)
        })
        group('Should get merchant contract list', () =>
            assert(getContractListByShopId(baseUrl, params, shopId), [
                statusOk(),
            ])
        )
    })
}
