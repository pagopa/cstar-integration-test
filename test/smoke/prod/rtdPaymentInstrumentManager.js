import { group } from 'k6'
import {
    getHashedPan,
    getSalt,
} from '../../common/api/rtdPaymentInstrumentManager.js'
import { assert, statusOk, bodyLengthBetween } from '../../common/assertions.js'
import dotenv from 'k6/x/dotenv'

export let options = {}
export let services = JSON.parse(open('../../../services/environments.json'))

// open is only available in global scope
const myEnv = dotenv.parse(open('.env.production.local'))

options.tlsAuth = [
    {
        domains: [services.prod_issuer.baseUrl],
        cert: open(`../../../certs/${myEnv.MAUTH_CERT_NAME}`),
        key: open(`../../../certs/${myEnv.MAUTH_PRIVATE_KEY_NAME}`),
    },
]

export default () => {
    group('Payment Instrument API', () => {
        let params = {
            headers: {
                'Ocp-Apim-Subscription-Key': myEnv.APIM_RTDPRODUCT_SK,
                'Ocp-Apim-Trace': 'true',
            },
        }

        group('Should get hashed pans', () =>
            assert(getHashedPan(services.prod_issuer.baseUrl, params), [
                statusOk(),
                bodyLengthBetween(0, myEnv.RTD_HASHPAN_MAX_CONTENT_LENGTH),
            ])
        )
        group('Should get salt', () =>
            assert(getSalt(services.prod_issuer.baseUrl, params), [statusOk()])
        )
    })
}
