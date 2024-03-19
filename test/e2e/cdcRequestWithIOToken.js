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
    failureWithYearListTooLong,
    failureWithGoodYearInWrongFormat,
    failureCaseWithNoInput,
} from '../common/api/cdcIoRequest.js'
import { loginFullUrl } from '../common/api/bpdIoLogin.js'
import {
    assert,
    bodyJsonReduceArray,
    statusOk,
    statusBadFormat,
    bodyJsonSelectorValue,
    idempotence, emptyBody,
} from '../common/assertions.js'
import { isEnvValid, isTestEnabledOnEnv, PROD } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'
import { randomFiscalCode } from '../common/utils.js'

const REGISTERED_ENVS = [PROD]

const services = JSON.parse(open('../../services/environments.json'))
let baseUrl
let myEnv

if (isEnvValid(__ENV.TARGET_ENV)) {
    myEnv = dotenv.parse(open(`../../.env.${__ENV.TARGET_ENV}.local`))
    baseUrl = services[`${__ENV.TARGET_ENV}_io`].baseUrl
}

function auth() {
    return {
        headers: {
            Authorization: `Bearer ${myEnv.BPD_TOKEN}`,
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
                prv && ['OK', 'CIT_REGISTRATO', 'INIZIATIVA_TERMINATA'].includes(cur.esitoRichiesta)
            assert(happyCase(baseUrl, auth()), [
                statusOk(),
                bodyJsonReduceArray(
                    'listaEsitoRichiestaPerAnno',
                    esitoOkReducer,
                    true,
                    true
                ),
            ])
        })
    })

    group('POST Request should be', () => {
        group('Idempotent', () => {
            assert(postIdempotence(baseUrl, auth()), [idempotence()])
        })
    })

    group('GET Request should be', () => {
        group('Idempotent', () => {
            assert(getIdempotence(baseUrl, auth()), [idempotence()])
        })
    })

    group('Should not Request CdC', () => {
        group('When the list of years is empty', () => {
            assert(failureCaseWithEmptyYearList(baseUrl, auth()), [
                statusBadFormat(),
                bodyJsonSelectorValue('status', 'LISTA_ANNI_VUOTA'),
            ])
        })
        group(
            'When the customer selects only a subset of admissible years plus a wrong year',
            () => {
                assert(failureWithWrongYear(baseUrl, auth()), [
                    statusBadFormat(),
                    bodyJsonSelectorValue('status', 'FORMATO_ANNI_ERRATO'),
                ])
            }
        )
        group(
            'When the customer selects a list of years which is longer than expected',
            () => {
                assert(failureWithYearListTooLong(baseUrl, auth()), [
                    statusBadFormat(),
                    bodyJsonSelectorValue(
                        'status',
                        'INPUT_SUPERIORE_AL_CONSENTITO'
                    ),
                ])
            }
        )
        group(
            'When the customer send a year in a wrong format (e.g. as a date 2021/01/01)',
            () => {
                assert(failureWithGoodYearInWrongFormat(baseUrl, auth()), [
                    statusBadFormat(),
                    bodyJsonSelectorValue('status', 'FORMATO_ANNI_ERRATO'),
                ])
            }
        )
        group('When the customer sends no input', () => {
            assert(failureCaseWithNoInput(baseUrl, auth()), [
                statusBadFormat(),
                emptyBody(),
            ])
        })
    })
}
