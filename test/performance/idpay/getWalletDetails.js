import { group, sleep } from 'k6'
import { assert, statusOk } from '../../common/assertions.js'
import { DEV, UAT, getBaseUrl } from '../../common/envs.js'

import {
    getWalletDetail,
    WALLET_API_NAMES,
} from '../../common/api/idpay/idpayWallet.js'
import { getFCList } from '../../common/utils.js'
import { SharedArray } from 'k6/data'
import {
    IDPAY_CONFIG,
    retrieveAndBuildIOAuthorizationHeader,
} from '../../common/idpay/envVars.js'
import defaultHandleSummaryBuilder from '../../common/handleSummaryBuilder.js'
import { defaultApiOptionsBuilder } from '../../common/dynamicScenarios/defaultOptions.js'
import {
    getScenarioTestEntity,
    logErrorResult,
} from '../../common/dynamicScenarios/utils.js'

// Environments allowed to be tested
const REGISTERED_ENVS = [DEV, UAT]
const baseUrl = getBaseUrl(REGISTERED_ENVS, 'io')

const application = 'idpay'
const testName = 'getWalletDetail'

// Set up data for processing, share data among VUs
const cfList = new SharedArray('cfList', getFCList)

// Dynamic scenarios' K6 configuration
export const options = defaultApiOptionsBuilder(
    application,
    testName,
    [WALLET_API_NAMES.getWalletDetail] // applying apiName tags to thresholds
)

// K6 summary configuration
export const handleSummary = defaultHandleSummaryBuilder(application, testName)

export default () => {
    const cf = getScenarioTestEntity(cfList).FC
    const params = { headers: retrieveAndBuildIOAuthorizationHeader(cf) }

    group('When onboarding is completed, get wallet detail', () => {
        const res = getWalletDetail(
            baseUrl,
            IDPAY_CONFIG.CONTEXT_DATA.initiativeId,
            params
        )

        if (res.status !== 200) {
            logErrorResult(
                `Wallet associated to user with cf [${cf}] not found`,
                res,
                true
            )
        }

        assert(res, [statusOk()])
    })
    sleep(1)
}
