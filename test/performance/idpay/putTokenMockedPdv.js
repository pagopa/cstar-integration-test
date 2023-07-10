import { group, sleep } from 'k6'
import { upsertMockToken } from '../../common/api/pdv.js'
import { assert, statusOk } from '../../common/assertions.js'
import { DEV, UAT, PROD, getBaseUrl } from '../../common/envs.js'
import { getFCList } from '../../common/utils.js'
import { SharedArray } from 'k6/data'
import defaultHandleSummaryBuilder from '../../common/handleSummaryBuilder.js'
import { defaultHeaders } from '../../common/dynamicScenarios/envVars.js'
import { defaultApiOptionsBuilder } from '../../common/dynamicScenarios/defaultOptions.js'
import {
    getScenarioTestEntity,
    logErrorResult,
} from '../../common/dynamicScenarios/utils.js'

const REGISTERED_ENVS = [DEV, UAT, PROD]
const baseUrl = getBaseUrl(REGISTERED_ENVS, 'issuer')

const application = 'pdv'
const testName = 'putTokenMockedPdv'

// Set up data for processing, share data among VUs
const cfList = new SharedArray('cfList', getFCList)

// K6 configurations
export const options = defaultApiOptionsBuilder(application, testName)

export const handleSummary = defaultHandleSummaryBuilder(application, testName)

export default () => {
    //MOCK TOKEN
    const scenarioEntity = getScenarioTestEntity(cfList)
    const uniqueCF = scenarioEntity.FC

    group('Should pdv put a cf', () => {
        group('Returns a token', () => {
            const params = {
                headers: defaultHeaders,
                body: {
                    pii: uniqueCF,
                },
            }

            const res = upsertMockToken(
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
