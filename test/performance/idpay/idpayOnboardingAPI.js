import { group, sleep, check } from 'k6'
import {
    putOnboardingCitizen,
    putCheckPrerequisites,
    getStatus,
    putSaveConsent,
    ONBOARDING_API_NAMES,
} from '../../common/api/idpay/idpayOnboardingCitizen.js'
import {
    getWalletDetail,
    WALLET_API_NAMES,
} from '../../common/api/idpay/idpayWallet.js'
import {
    assert,
    statusNoContent,
    statusAccepted,
    statusOk,
    bodyJsonSelectorValue,
} from '../../common/assertions.js'
import { DEV, UAT, getBaseUrl } from '../../common/envs.js'
import { getFCList, getUserIdsList } from '../../common/utils.js'
import { SharedArray } from 'k6/data'
import defaultHandleSummaryBuilder from '../../common/handleSummaryBuilder.js'
import { defaultApiOptionsBuilder } from '../../common/dynamicScenarios/defaultOptions.js'
import {
    IDPAY_CONFIG,
    getIdPayScenarioUserToken,
} from '../../common/idpay/envVars.js'
import { logErrorResult } from '../../common/dynamicScenarios/utils.js'
import { CONFIG } from '../../common/dynamicScenarios/envVars.js'

// Environments allowed to be tested
const REGISTERED_ENVS = [DEV, UAT]
const baseUrl = getBaseUrl(REGISTERED_ENVS, 'io') // api-io services baseUrl

// test tags
const application = 'idpay'
const testName = 'idpayOnboardingAPI'

// Set up data for processing, share data among VUs
const usersList = new SharedArray(
    'usersList',
    CONFIG.USE_INTERNAL_ACCESS_ENV ? getUserIdsList : getFCList
)

// Dynamic scenarios' K6 configuration
export const options = defaultApiOptionsBuilder(
    application,
    testName,
    Object.values(ONBOARDING_API_NAMES).concat({
        apiName: WALLET_API_NAMES.getWalletDetail,
        maxHttpReqFailedRate: 0.999,
    }) // applying apiName tags to thresholds
)

// K6 summary configuration
export const handleSummary = defaultHandleSummaryBuilder(application, testName)

export default () => {
    let checked = true
    const isOnboardingTestScript = CONFIG.SCRIPT_ENV === 'idpayOnboardingAPI'

    // selecting current scenario/iteration test token
    const token = getIdPayScenarioUserToken(usersList)

    group('Should onboard Citizen', () => {
        group('When the inititive exists, put t&c', () => {
            if (checked) {
                const res = putOnboardingCitizen(
                    CONFIG.USE_INTERNAL_ACCESS_ENV,
                    token,
                    IDPAY_CONFIG.CONTEXT_DATA.initiativeId
                )
                assert(res, [statusNoContent()])
                if (res.status != 204) {
                    logErrorResult('PutOnboardingCitizen', res, true)
                    checked = false
                    return
                }
            }
        })

        if (isOnboardingTestScript) {
            group('Check accepted status', () => {
                if (checked) {
                    const res = getStatus(
                        CONFIG.USE_INTERNAL_ACCESS_ENV,
                        token,
                        IDPAY_CONFIG.CONTEXT_DATA.initiativeId
                    )

                    assert(res, [
                        statusOk(),
                        bodyJsonSelectorValue('status', 'ACCEPTED_TC'),
                    ])

                    if (res.status != 200) {
                        logErrorResult('GetStatus', res, true)
                        checked = false
                        return
                    }
                }
            })
        }

        group('When the TC consent exists, check the prerequisites', () => {
            if (checked) {
                const res = putCheckPrerequisites(
                    CONFIG.USE_INTERNAL_ACCESS_ENV,
                    token,
                    IDPAY_CONFIG.CONTEXT_DATA.initiativeId
                )

                assert(res, [statusOk()])

                if (res.status != 200) {
                    logErrorResult('PutCheckPrerequisites', res, true)
                    checked = false
                    return
                }
            }
        })

        group('When the inititive and consents exist, save consent', () => {
            if (checked) {
                const res = putSaveConsent(
                    CONFIG.USE_INTERNAL_ACCESS_ENV,
                    token,
                    IDPAY_CONFIG.CONTEXT_DATA.initiativeId
                )

                assert(res, [statusAccepted()])

                if (res.status != 202) {
                    logErrorResult('PutSaveConsent', res, true)
                    checked = false
                }
            }
        })

        if (isOnboardingTestScript) {
            group('When onboarding is completed, get wallet detail', () => {
                if (checked) {
                    sleep(1)

                    const res = getWalletDetail(
                        baseUrl,
                        IDPAY_CONFIG.CONTEXT_DATA.initiativeId,
                        params
                    )

                    check(res, {
                        'HTTP status is 200 or 404': (r) =>
                            r.status === 200 || r.status === 404,
                    })

                    if (res.status === 404) {
                        logErrorResult(
                            `Wallet associated to user with cf [${cf}] not found`,
                            res,
                            true
                        )
                    }
                }
            })
        }
    })
    sleep(1)
}
