import { group } from 'k6'
import {
    createTransaction,
    preAuth,
    authTrx,
    PAYMENT_API_NAMES,
} from '../../common/api/idpay/idPayPaymentDiscount.js'
import { assert, statusCreated, statusOk } from '../../common/assertions.js'
import {
    getFCList,
    getMerchantIdList,
    getMerchantList,
    getUserIdsList,
} from '../../common/utils.js'
import { SharedArray } from 'k6/data'
import defaultHandleSummaryBuilder from '../../common/handleSummaryBuilder.js'
import {
    IDPAY_CONFIG,
    getIdPayScenarioUserToken,
    getIdPayScenarioMerchantToken,
} from '../../common/idpay/envVars.js'
import { defaultApiOptionsBuilder } from '../../common/dynamicScenarios/defaultOptions.js'
import { logErrorResult } from '../../common/dynamicScenarios/utils.js'
import { CONFIG } from '../../common/dynamicScenarios/envVars.js'

// test tags
const application = 'idpay'
const testName = 'idpayPaymentDiscountAPI'

// Set up data for processing, share data among VUs
const usersList = new SharedArray(
    'usersList',
    CONFIG.USE_INTERNAL_ACCESS_ENV ? getUserIdsList : getFCList
)
const merchantList = new SharedArray(
    'merchantList',
    CONFIG.USE_INTERNAL_ACCESS_ENV ? getMerchantIdList : getMerchantList
)

// Dynamic scenarios' K6 configuration
export const options = defaultApiOptionsBuilder(
    application,
    testName,
    Object.values(PAYMENT_API_NAMES), // applying apiName tags to thresholds
    {
        // configuring specific http request duration thresholds
        maxAvgDurationMs: 250,
        maxP90DurationMs: 250,
        maxP95DurationMs: 250,
    }
)

// K6 summary configuration
export const handleSummary = defaultHandleSummaryBuilder(application, testName)

export default () => {
    let checked = true
    let trxCode

    // selecting current scenario/iteration test tokens
    const citizenToken = getIdPayScenarioUserToken(usersList)
    const merchantToken = getIdPayScenarioMerchantToken(merchantList)

    group('Create Transaction', () => {
        if (checked) {
            const trx = {
                initiativeId: IDPAY_CONFIG.CONTEXT_DATA.initiativeId,
                idTrxAcquirer: `IDTRXACQUIRER${Math.floor(
                    Math.random() * (100 - 10 + 10) + 1
                )}`,
                amountCents: '100',
                mcc: `MCC${Math.floor(Math.random() * (100 - 10 + 10) + 1)}`,
            }

            const res = createTransaction(
                CONFIG.USE_INTERNAL_ACCESS_ENV,
                merchantToken,
                trx
            )

            assert(res, [statusCreated()])
            if (res.status != 201) {
                logErrorResult('Create Trx', res, true)
                checked = false
                return
            }

            const bodyObj = JSON.parse(res.body)
            trxCode = bodyObj.trxCode
        }
    })

    group('Pre Auth Transaction', () => {
        if (checked) {
            const res = preAuth(
                CONFIG.USE_INTERNAL_ACCESS_ENV,
                citizenToken,
                trxCode
            )

            assert(res, [statusOk()])
            if (res.status != 200) {
                logErrorResult('preAuth', res, true)
                checked = false
                return
            }
        }
    })
    group('Auth Transaction', () => {
        if (checked) {
            const res = authTrx(
                CONFIG.USE_INTERNAL_ACCESS_ENV,
                citizenToken,
                trxCode
            )

            assert(res, [statusOk()])
            if (res.status != 200) {
                logErrorResult('Auth', res, true)
                checked = false
                return
            }
        }
    })
}
