import { group } from 'k6'
import { happyCase, partialHappyCase } from '../common/api/cdcIoRequest.js'
import { loginFullUrl } from '../common/api/bpdIoLogin.js'
import { assert, bodyJsonReduceArray, statusOk } from '../common/assertions.js'
import { isEnvValid, isTestEnabledOnEnv, UAT } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'
import { randomFiscalCode } from '../common/utils.js'

const REGISTERED_ENVS = [UAT]

const services = JSON.parse(open('../../services/environments.json'))
let baseUrl
let myEnv

if (isEnvValid(__ENV.TARGET_ENV)) {
    myEnv = dotenv.parse(open(`../../.env.${__ENV.TARGET_ENV}.local`))
    baseUrl = services[`${__ENV.TARGET_ENV}_io`].baseUrl
}

function auth(fiscalCode) {
    const authToken = loginFullUrl(
        `${baseUrl}/bpd/pagopa/api/v1/login`,
        fiscalCode
    )
    return {
        headers: {
            Authorization: `Bearer ${authToken}`,
            'Ocp-Apim-Subscription-Key': `${myEnv.APIM_SK};product=app-io-product`,
            'Ocp-Apim-Trace': 'true',
        },
    }
}

export default () => {
    if (
        !isEnvValid(__ENV.TARGET_ENV) ||
        !isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)
    ) {
        return
    }
    group('Should request CdC', () => {
        group('When the post contains all years returned by get', () => {
            const esitoOkReducer = (prv, cur) =>
                prv && cur.esitoRichiesta === 'OK'
            assert(happyCase(baseUrl, auth(randomFiscalCode())), [
                statusOk(),
                bodyJsonReduceArray(
                    'listaEsitoRichiestaPerAnno',
                    esitoOkReducer,
                    true,
                    true
                ),
            ])
        })
        group(
            'When the customer selects only a subset of admissible years',
            () => {
                // This test case ends with a GET
                const valutazioneCounter = (prv, cur) =>
                    cur.statoBeneficiario === 'VALUTAZIONE' ? (prv += 1) : prv
                const admissibleStateCounter = (prv, cur) =>
                    ['VALUTAZIONE', 'ATTIVABILE'].includes(
                        cur.statoBeneficiario
                    )
                        ? prv += 1
                        : prv
                assert(partialHappyCase(baseUrl, auth(randomFiscalCode())), [
                    statusOk(),
                    bodyJsonReduceArray(
                        'listaStatoPerAnno',
                        valutazioneCounter,
                        0,
                        1
                    ),
                    bodyJsonReduceArray(
                        'listaStatoPerAnno',
                        admissibleStateCounter,
                        0,
                        3
                    ),
                ])
            }
        )
    })
}
