import { group, sleep } from 'k6'
import { assert, statusOk } from '../../common/assertions.js'
import { DEV, UAT, PROD, getBaseUrl } from '../../common/envs.js'
import defaultHandleSummaryBuilder from '../../common/handleSummaryBuilder.js'
import { putEnrollIbanIssuer } from '../../common/api/idpay/idPayWallet.js'
import { getFCIbanList } from '../../common/utils.js'
import { SharedArray } from 'k6/data'
import {
    IDPAY_CONFIG,
    idpayDefaultHeaders,
} from '../../common/idpay/envVars.js'
import { defaultApiOptionsBuilder } from '../../common/dynamicScenarios/defaultOptions.js'
import {
    getScenarioTestEntity,
    logErrorResult,
} from '../../common/dynamicScenarios/utils.js'

const REGISTERED_ENVS = [DEV, UAT, PROD]
const baseUrl = getBaseUrl(REGISTERED_ENVS, 'io')

const application = 'idpay'
const testName = 'ioPutEnrollIbanIssuer'

// Set up data for processing, share data among VUs
const cfPanList = new SharedArray('cfPanList', getFCIbanList)

// K6 configurations
export const options = defaultApiOptionsBuilder(application, testName)

export const handleSummary = defaultHandleSummaryBuilder(application, testName)

export default () => {
    const scenarioEntity = getScenarioTestEntity(cfPanList)
    const cf = scenarioEntity.FC
    const iban = scenarioEntity.IBAN

    group('Iban API', () => {
        group('Should enroll iban', () => {
            const params = {
                headers: Object.assign(
                    {
                        'Accept-Language': 'it_IT',
                        'Fiscal-Code': cf,
                    },
                    idpayDefaultHeaders
                ),
                body: {
                    iban: iban,
                    description: `conto cointestato`,
                },
            }

            const res = putEnrollIbanIssuer(
                baseUrl,
                JSON.stringify(params.body),
                params.headers,
                IDPAY_CONFIG.CONTEXT_DATA.initiativeId
            )

            if (res.status != 200) {
                logErrorResult('Enrollment IBAN', res, true)
                return
            }

            assert(res, [statusOk()])
        })
    })
    sleep(1)
}
