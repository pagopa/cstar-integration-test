import { group } from 'k6'
import { getPaymentInstrumentList } from '../common/api/pmWalletExt.js'
import { assert, statusOk } from '../common/assertions.js'
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

export const options = {}
const params = {}
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
        'Ocp-Apim-Subscription-Key':
            myEnv.APIM_PM_PRODUCT_SK + ';product=pm-api-product',
        'Ocp-Apim-Trace': 'true',
        'Content-Type': 'application/json',
    }
}

export default () => {
    if (
        !isEnvValid(__ENV.TARGET_ENV) ||
        !isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)
    ) {
        return
    }
    group('PM wallet-ext API', () => {
        group("Should get a list of user's wallets", () => {
            assert(
                getPaymentInstrumentList(
                    baseUrl,
                    params,
                    myEnv.FISCAL_CODE_EXISTING
                ),
                [statusOk()]
            )
        })
    })
}
