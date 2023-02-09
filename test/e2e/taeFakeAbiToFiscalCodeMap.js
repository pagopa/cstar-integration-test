import { group } from 'k6'
import {
    assert,
    statusOk,
    bodyJsonSelectorValue,
} from '../common/assertions.js'
import { isEnvValid, isTestEnabledOnEnv, DEV } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'
import { randomFiscalCode } from '../common/utils.js'
import { getAbiToFiscalCodesMap } from '../common/api/taeAbiToFiscalCodes.js'

const REGISTERED_ENVS = [DEV]

const services = JSON.parse(open('../../services/environments.json'))
let params = {}
export let options = {}
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
        'Ocp-Apim-Subscription-Key': myEnv.APIM_RTDPRODUCT_SK,
    }
}

export default () => {
    group('TAE AbiToFiscalCode API', () => {
        group('Should retrieve conversion map', () =>
            assert(getAbiToFiscalCodesMap(baseUrl, params), [
                statusOk(),
                bodyJsonSelectorValue('STPAY', 'LU30726739'),
                bodyJsonSelectorValue('BPAY1', '04949971008'),
                bodyJsonSelectorValue('SUMUP', 'IE9813461A'),
                bodyJsonSelectorValue('ICARD', 'BG175325806'),
                bodyJsonSelectorValue('TPAY1', '09771701001'),
                bodyJsonSelectorValue('AMAZN', '97898850157'),
                bodyJsonSelectorValue('EURON', 'DE182769455'),
                bodyJsonSelectorValue('UBER1', 'NL858620285B01')
            ])
        )
    })
}
