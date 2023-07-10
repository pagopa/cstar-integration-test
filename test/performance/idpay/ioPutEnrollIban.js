import { group, sleep } from 'k6'
import { assert, statusOk } from '../../common/assertions.js'
import { DEV, UAT, PROD, getBaseUrl } from '../../common/envs.js'
import { putEnrollIban } from '../../common/api/idpay/idPayWallet.js'
import { getFCIbanList } from '../../common/utils.js'
import { SharedArray } from 'k6/data'
import defaultHandleSummaryBuilder from '../../common/handleSummaryBuilder.js'
import { defaultApiOptionsBuilder } from '../../common/dynamicScenarios/defaultOptions.js'
import {
    IDPAY_CONFIG,
    buildIOAuthorizationHeader,
} from '../../common/idpay/envVars.js'
import {
    getScenarioTestEntity,
    logErrorResult,
} from '../../common/dynamicScenarios/utils.js'

const REGISTERED_ENVS = [DEV, UAT, PROD]
const baseUrl = getBaseUrl(REGISTERED_ENVS, 'io')

const application = 'idpay'
const testName = 'ioPutEnrollIban'

// Set up data for processing, share data among VUs
const cfIbanList = new SharedArray('cfIbanList', getFCIbanList)

// K6 configurations
export const options = defaultApiOptionsBuilder(application, testName)

export const handleSummary = defaultHandleSummaryBuilder(application, testName)

export default () => {
    let checked = true

    const scenarioEntity = getScenarioTestEntity(cfIbanList)
    const cf = scenarioEntity.FC
    const iban = scenarioEntity.IBAN

    const params = { headers: buildIOAuthorizationHeader(cf) }

    group('Iban API', () => {
        group('Should enroll iban', () => {
            const res = putEnrollIban(
                baseUrl,
                IDPAY_CONFIG.CONTEXT_DATA.initiativeId,
                params,
                JSON.stringify({
                    iban,
                    description: `conto cointestato`,
                })
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
