import { group } from 'k6'
import {
    happyCase,
    postIdempotence,
    getIdempotence,
    failureCaseWithEmptyYearList,
    failureWithWrongYear,
    failureWithYearListTooLong,
    failureWithGoodYearInWrongFormat,
} from '../common/api/cdcIoRequest.js'
import {
    assert,
    bodyJsonReduceArray,
    statusOk,
    statusBadFormat,
    bodyJsonSelectorValue,
    idempotence,
} from '../common/assertions.js'
import { isEnvValid, isTestEnabledOnEnv, PROD, INTERNAL } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'

const REGISTERED_ENVS = [PROD, INTERNAL]

export let options = {
    scenarios: {
        constant_request_rate: {
            executor: 'constant-arrival-rate',
            rate: 10,
            timeUnit: '1s',
            duration: '30s',
            preAllocatedVUs: 1,
            maxVUs: 100,
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

            console.log("\n\n********\n\n")
            console.log(baseUrl)
            console.log(myEnv)
            console.log("\n\n********\n\n")


            const esitoOkReducer = (prv, cur) =>
                prv && ( ['OK', 'CIT_REGISTRATO'].includes(
                  cur.esitoRichiesta)
              )
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
            assert(postIdempotence(baseUrl, auth()), [
                idempotence(),
            ])
        })
    })

    group('GET Request should be', () => {
        group('Idempotent', () => {
            assert(getIdempotence(baseUrl, auth()), [
                idempotence(),
            ])
        })
    })

    group('Should not Request CdC', () => {
        group('When the list of years is empty', () => {
            assert(
                failureCaseWithEmptyYearList(baseUrl, auth()),
                [
                    statusBadFormat(),
                    bodyJsonSelectorValue('status', 'LISTA_ANNI_VUOTA'),
                ]
            )
        })
        group(
            'When the customer selects only a subset of admissible years plus a wrong year',
            () => {
                assert(
                    failureWithWrongYear(baseUrl, auth()),
                    [
                        statusBadFormat(),
                        bodyJsonSelectorValue('status', 'FORMATO_ANNI_ERRATO'),
                    ]
                )
            }
        )
        group(
            'When the customer selects a list of years which is longer than expected',
            () => {
                assert(
                    failureWithYearListTooLong(
                        baseUrl,
                        auth()
                    ),
                    [
                        statusBadFormat(),
                        bodyJsonSelectorValue(
                            'status',
                            'INPUT_SUPERIORE_AL_CONSENTITO'
                        ),
                    ]
                )
            }
        )
        group(
            'When the customer send a year in a wrong format (e.g. as a date 2021/01/01)',
            () => {
                assert(
                    failureWithGoodYearInWrongFormat(
                        baseUrl,
                        auth()
                    ),
                    [
                        statusBadFormat(),
                        bodyJsonSelectorValue('status', 'FORMATO_ANNI_ERRATO'),
                    ]
                )
            }
        )
        // group('When the customer sends no input', () => {
        //     assert(failureCaseWithNoInput(baseUrl, auth()), [
        //         statusBadFormat(),
        //         bodyJsonSelectorValue('status', 'NO_INPUT'),
        //     ])
        // })
    })
}
