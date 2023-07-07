import { group, sleep } from 'k6'
import {
    putOnboardingCitizen,
    putCheckPrerequisites,
    getStatus,
    putSaveConsent,
} from '../../common/api/idpay/idpayOnboardingCitizen.js'
import {
    assert,
    statusNoContent,
    statusAccepted,
    statusOk,
    bodyJsonSelectorValue,
} from '../../common/assertions.js'
import { DEV, UAT, PROD, getBaseUrl } from '../../common/envs.js'
import { getFCList } from '../../common/utils.js'
import { SharedArray } from 'k6/data'
import defaultHandleSummaryBuilder from '../../common/handleSummaryBuilder.js'
import { defaultApiOptionsBuilder } from '../../common/dynamicScenarios/defaultOptions.js'
import {
    IDPAY_CONFIG,
    buildIOAuthorizationHeader,
} from '../../common/idpay/envVars.js'
import { getScenarioTestEntity } from '../../common/dynamicScenarios/utils.js'

const REGISTERED_ENVS = [DEV, UAT, PROD]
const baseUrl = getBaseUrl(REGISTERED_ENVS, 'io')

const application = 'idpay'
const testName = 'idpayOnboardingAPI'

// Set up data for processing, share data among VUs
const cfList = new SharedArray('cfList', getFCList)

// K6 configurations
export const options = defaultApiOptionsBuilder(application, testName)

export const handleSummary = defaultHandleSummaryBuilder(application, testName)

export default () => {
    let checked = true

    const cf = getScenarioTestEntity(cfList).FC
    const params = { headers: buildIOAuthorizationHeader(cf) }

    group('Should onboard Citizen', () => {
        group('When the inititive exists, put t&c', () => {
            if (checked) {
                const body = {
                    initiativeId: IDPAY_CONFIG.CONTEXT_DATA.INITIATIVE_ID,
                }
                const res = putOnboardingCitizen(
                    baseUrl,
                    JSON.stringify(body),
                    params
                )
                assert(res, [statusNoContent()])
                if (res.status != 204) {
                    console.error(
                        'PutOnboardingCitizen -> ' + JSON.stringify(res)
                    )
                    checked = false
                    return
                }
            }
        })
        group('Check accepted status', () => {
            if (checked) {
                const res = getStatus(
                    baseUrl,
                    params,
                    IDPAY_CONFIG.CONTEXT_DATA.INITIATIVE_ID
                )

                assert(res, [
                    statusOk(),
                    bodyJsonSelectorValue('status', 'ACCEPTED_TC'),
                ])

                if (res.status != 200) {
                    console.error('GetStatus -> ' + JSON.stringify(res))
                    checked = false
                    return
                }
            }
        })

        group('When the TC consent exists, check the prerequisites', () => {
            if (checked) {
                const body = {
                    initiativeId: IDPAY_CONFIG.CONTEXT_DATA.INITIATIVE_ID,
                }
                const res = putCheckPrerequisites(
                    baseUrl,
                    JSON.stringify(body),
                    params
                )

                assert(res, [statusOk()])

                if (res.status != 200) {
                    console.error(
                        'PutCheckPrerequisites -> ' + JSON.stringify(res)
                    )
                    checked = false
                    return
                }
            }
        })

        group('When the inititive and consents exist, save consent', () => {
            if (checked) {
                const body = {
                    initiativeId: IDPAY_CONFIG.CONTEXT_DATA.INITIATIVE_ID,
                    pdndAccept: true,
                    selfDeclarationList: [],
                }
                const res = putSaveConsent(
                    baseUrl,
                    JSON.stringify(body),
                    params
                )

                assert(res, [statusAccepted()])

                if (res.status != 202) {
                    console.error('PutSaveConsent -> ' + JSON.stringify(res))
                    checked = false
                }
            }
        })
    })
    sleep(1)
}
