import http from 'k6/http'
import { group } from 'k6'
import { login } from '../../common/api/bpdIoLogin.js'
import { GetBpdIoPaymentInstrumentV1 } from '../../common/api/bpdIoPaymentInstruments.js'
import {
    assert,
    statusOk,
    bodyJsonSelectorValue,
} from '../../common/assertions.js'
import dotenv from 'k6/x/dotenv'

export let services = JSON.parse(open('../../../services/environments.json'))

// open is only available in global scope
const myEnv = dotenv.parse(open('.env.test.local'))

export function setup() {
    return login(services.uat_io.baseUrl, myEnv.FISCAL_CODE_EXISTING)
}

export default (authToken) => {
    group('Payment Instrument API', () => {
        let params = {
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Ocp-Apim-Subscription-Key': `${myEnv.APIM_SK};product=app-io-product`,
                'Ocp-Apim-Trace': 'true',
            },
        }

        group('Should get payment instrument', () =>
            assert(
                GetBpdIoPaymentInstrumentV1(
                    services.uat_io.baseUrl,
                    params,
                    myEnv.PAYMENT_INSTRUMENT_EXISTING
                ),
                [
                    statusOk(),
                    bodyJsonSelectorValue(
                        'hpan',
                        myEnv.PAYMENT_INSTRUMENT_EXISTING
                    ),
                ]
            )
        )
    })
}
