import { group, sleep } from 'k6'
import { upsertToken } from '../../common/api/pdv.js'
import { assert, statusOk } from '../../common/assertions.js'
import { DEV, UAT, getBaseUrl } from '../../common/envs.js'
import { getFCList } from '../../common/utils.js'
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
const baseUrl = getBaseUrl(REGISTERED_ENVS, 'pdv')

const application = 'pdv'
const testName = 'putTokenPdv'

// Set up data for processing, share data among VUs
const cfList = new SharedArray('cfList', getFCList)

// K6 configurations
export const options = defaultApiOptionsBuilder(application, testName)

export const handleSummary = defaultHandleSummaryBuilder(application, testName)

export default () => {
    const scenarioEntity = getScenarioTestEntity(cfList)
    const uniqueCF = scenarioEntity.FC
    const headers = Object.assign({}, idpayDefaultHeaders, {
        'x-api-key': IDPAY_CONFIG.AUTH_KEYS.PDV_API_KEY,
    })

    //UPSERT TOKEN
    group('Should onboard Citizen', () => {
        group('When the inititive and consents exist', () => {
            const params = {
                headers,
                body: {
                    pii: uniqueCF,
                },
            }

            const res = upsertToken(
                baseUrl,
                JSON.stringify(params.body),
                params
            )

            if (res.status != 200) {
                logErrorResult('putToken', res, true)
                return
            }

            assert(res, [statusOk()])
        })
    })
    sleep(1)
}
