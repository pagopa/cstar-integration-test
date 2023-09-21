import { group, sleep, check } from 'k6'
import { SharedArray } from 'k6/data'
import { ONBOARDING_API_NAMES } from '../../common/api/idpay/idpayOnboardingCitizen.js'
import {
    getWalletDetail,
    WALLET_API_NAMES,
} from '../../common/api/idpay/idpayWallet.js'
import { getFCList, getUserIdsList } from '../../common/utils.js'
import { defaultApiOptionsBuilder } from '../../common/dynamicScenarios/defaultOptions.js'
import { IDPAY_CONFIG, getIdPayScenarioUserToken } from '../../common/idpay/envVars.js'
import { logErrorResult } from '../../common/dynamicScenarios/utils.js'
import { CONFIG } from '../../common/dynamicScenarios/envVars.js'

// Set up data for processing, share data among VUs
const usersList = new SharedArray(
    'usersList',
    CONFIG.USE_INTERNAL_ACCESS_ENV ? getUserIdsList : getFCList
)

// test tags
const application = 'idpay'
const testName = 'idpayVerifyOnboarding'

export const options = Object.assign(
    {},
    defaultApiOptionsBuilder(
        application,
        testName,
        Object.values(ONBOARDING_API_NAMES)
            .filter(
                (api) =>
                    api !== ONBOARDING_API_NAMES.checkInitiativeBudget &&
                    api !== ONBOARDING_API_NAMES.getInitiative
            )
            .concat({
                apiName: WALLET_API_NAMES.getWalletDetail,
                maxHttpReqFailedRate: 0.999,
            }) // applying apiName tags to thresholds
    ),
    {
        setupTimeout: '120s'
    }
);

export function setup() {
    console.log("Waiting 1 minute before verify")
    sleep(60) // 1 minute
    console.log("Starting verify")
}

export default () => {
    // selecting current scenario/iteration test token
    const token = getIdPayScenarioUserToken(usersList)

    group('Wallet must exist', () => {
        const res = getWalletDetail(
            CONFIG.USE_INTERNAL_ACCESS_ENV,
            token,
            IDPAY_CONFIG.CONTEXT_DATA.initiativeId
        )

        check(res, {
            'HTTP status is 200 or 404': (r) =>
                r.status === 200 || r.status === 404,
        })

        if (res.status === 404) {
            logErrorResult(
                `Wallet associated to user with token [${token}] not found`,
                res,
                true
            )
        }
    })
};
