import { group, sleep } from 'k6'
import { assert, statusOk } from '../../common/assertions.js'
import { DEV, UAT, getBaseUrl } from '../../common/envs.js'
import { putEnrollInstrumentIssuer } from '../../common/api/idpay/idPayWallet.js'
import { getFCPanList } from '../../common/utils.js'
import { SharedArray } from 'k6/data'
import defaultHandleSummaryBuilder from '../../common/handleSummaryBuilder.js'
import {
    IDPAY_CONFIG,
    idpayDefaultHeaders,
} from '../../common/idpay/envVars.js'
import { defaultApiOptionsBuilder } from '../../common/dynamicScenarios/defaultOptions.js'
import {
    getScenarioTestEntity,
    logErrorResult,
} from '../../common/dynamicScenarios/utils.js'

const REGISTERED_ENVS = [DEV, UAT]
const baseUrl = getBaseUrl(REGISTERED_ENVS, 'io')

const application = 'idpay'
const testName = 'ioPutEnrollInstrumentIssuer'

// Set up data for processing, share data among VUs
const cfPanList = new SharedArray('cfPanList', getFCPanList)

// K6 configurations
export const options = defaultApiOptionsBuilder(application, testName)

export const handleSummary = defaultHandleSummaryBuilder(application, testName)

export default () => {
    const scenarioEntity = getScenarioTestEntity(cfPanList)
    const cf = scenarioEntity.FC
    const pgpan = scenarioEntity.PGPPAN

    group('Payment Instrument API', () => {
        group('Should enroll pgpan', () => {
            const params = {
                headers: Object.assign(
                    {
                        'Accept-Language': 'it_IT',
                        'Fiscal-Code': cf,
                        'Ocp-Apim-Subscription-Key':
                            IDPAY_CONFIG.AUTH_KEYS.APIM_ISSUER_SK,
                    },
                    idpayDefaultHeaders
                ),
                body: {
                    brand: 'VISA',
                    type: 'DEB',
                    pgpPan: pgpan,
                    expireMonth: '08',
                    expireYear: '2028',
                    issuerAbiCode: '03069',
                    holder: 'TEST',
                },
            }

            const res = putEnrollInstrumentIssuer(
                baseUrl,
                JSON.stringify(params.body).replace(/\\\\/g, '\\'),
                params.headers,
                IDPAY_CONFIG.CONTEXT_DATA.initiativeId
            )

            if (res.status != 200) {
                logErrorResult('Enrollment Carte', res, true)
                return
            }

            assert(res, [statusOk()])
        })
    })
    sleep(1)
}
