import { group } from 'k6'
import {
    happyCase,
    happyCaseWithoutIseeDate,
    partialHappyCase,
    twoStepHappyCase,
    postIdempotence,
    getIdempotence,
    failureCaseWithEmptyYearList,
    failureWithWrongYear,
    failureWithYearListTooLong
} from '../common/api/cdcIoRequest.js'
import { loginFullUrl } from '../common/api/bpdIoLogin.js'
import {
    assert,
    bodyJsonReduceArray,
    statusOk,
    statusBadFormat,
    bodyJsonSelectorValue,
    idempotence,
} from '../common/assertions.js'
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
        group('When the post contains all years returned by get, without dataIsee', () => {
            const esitoOkReducer = (prv, cur) =>
                prv && cur.esitoRichiesta === 'OK'
            assert(happyCaseWithoutIseeDate(baseUrl, auth(randomFiscalCode())), [
                statusOk(),
                bodyJsonReduceArray(
                    'listaEsitoRichiestaPerAnno',
                    esitoOkReducer,
                    true,
                    true
                ),
            ])
        })
        // group('When the post contains all years returned by get, with a full dataIsee', () => {
        //     const esitoOkReducer = (prv, cur) =>
        //         prv && cur.esitoRichiesta === 'OK'
        //     assert(happyCaseWithIseeFullDate(baseUrl, auth(randomFiscalCode())), [
        //         statusOk(),
        //         bodyJsonReduceArray(
        //             'listaEsitoRichiestaPerAnno',
        //             esitoOkReducer,
        //             true,
        //             true
        //         ),
        //     ])
        // })
        group(
            'When the customer selects only a subset of admissible years',
            () => {
                // This test case ends with a GET
                const valutazioneCounter = (prv, cur) =>
                    cur.statoBeneficiario === 'VALUTAZIONE' ? (prv += 1) : prv
                const allAdmissibleStates = (prv, cur) =>
                    prv &&
                    ['VALUTAZIONE', 'ATTIVABILE'].includes(
                        cur.statoBeneficiario
                    )

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
                        allAdmissibleStates,
                        true,
                        true
                    ),
                ])
            }
        )
       
        group(
            'When the customer requests different years in different steps',
            () => {
                const allAdmissibleStates = (prv, cur) =>
                    prv && ['CIT_REGISTRATO', 'OK'].includes(cur.esitoRichiesta)

                const registratoCounter = (prv, cur) =>
                    cur.esitoRichiesta === 'CIT_REGISTRATO' ? (prv += 1) : prv

                assert(twoStepHappyCase(baseUrl, auth(randomFiscalCode())), [
                    statusOk(),
                    bodyJsonReduceArray(
                        'listaEsitoRichiestaPerAnno',
                        allAdmissibleStates,
                        true,
                        true
                    ),
                    bodyJsonReduceArray(
                        'listaEsitoRichiestaPerAnno',
                        registratoCounter,
                        0,
                        1
                    ),
                ])
            }
        )
    })

    group('POST Request should be', () => {
        group('Idempotent', () => {
            assert(postIdempotence(baseUrl, auth(randomFiscalCode())), [
                idempotence(),
            ])
        })
    })

    group('GET Request should be', () => {
        group('Idempotent', () => {
            assert(getIdempotence(baseUrl, auth(randomFiscalCode())), [
                idempotence(),
            ])
        })
    })

    group('Should not Request CdC', () => {
        group('When the list of years is empty', () => {
            assert(failureCaseWithEmptyYearList(baseUrl, auth(randomFiscalCode())), [
                statusBadFormat(),
                bodyJsonSelectorValue("status", "LISTA_ANNI_VUOTA"),
            ])
        })
        group(
            'When the customer selects only a subset of admissible years plus a wrong year',
            () => {
                assert(failureWithWrongYear(baseUrl, auth(randomFiscalCode())), [
                    statusBadFormat(),
                    bodyJsonSelectorValue("status", "FORMATO_ANNI_ERRATO"),
                ])
            }
        )
        group(
            'When the customer selects a list of years which is longer than expected',
            () => {
                assert(failureWithYearListTooLong(baseUrl, auth(randomFiscalCode())), [
                    statusBadFormat(),
                    bodyJsonSelectorValue("status", "INPUT_SUPERIORE_AL_CONSENTITO"),
                ])
            }
        )
    })
}
