import { group } from 'k6'
import {
    GetPublicKey,
    CreateAdeSas,
    CreateRtdSas,
} from '../../common/api/rtdCsvTransaction.js'
import {
    assert,
    statusOk,
    statusCreated,
    bodyPgpPublicKey,
} from '../../common/assertions.js'
import dotenv from 'k6/x/dotenv'

export let options = {}
export let services = JSON.parse(open('../../../services/environments.json'))

// open is only available in global scope
const myEnv = dotenv.parse(open('.env.development.local'))

options.tlsAuth = [
    {
        domains: [services.dev_issuer.baseUrl],
        cert: open(`../../../certs/${myEnv.MAUTH_CERT_NAME}`),
        key: open(`../../../certs/${myEnv.MAUTH_PRIVATE_KEY_NAME}`),
    },
]

export default () => {
    group('CSV Transaction API', () => {
        let params = {
            headers: {
                'Ocp-Apim-Subscription-Key': myEnv.APIM_RTDPRODUCT_SK,
                'Ocp-Apim-Trace': 'true',
            },
        }

        group('Should get public key', () =>
            assert(GetPublicKey(services.dev_issuer.baseUrl, params), [
                statusOk(),
                bodyPgpPublicKey(),
            ])
        )
        group('Should create AdE SAS', () =>
            assert(CreateAdeSas(services.dev_issuer.baseUrl, params), [
                statusCreated(),
            ])
        )
        group('Should create RTD SAS', () =>
            assert(CreateRtdSas(services.dev_issuer.baseUrl, params), [
                statusCreated(),
            ])
        )
    })
}
