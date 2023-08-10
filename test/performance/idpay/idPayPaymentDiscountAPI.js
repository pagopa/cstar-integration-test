import { group } from 'k6'
import {
    createTransaction,
    preAuth,
    authTrx,
    PAYMENT_API_NAMES,
} from '../../common/api/idpay/idPayPaymentDiscount.js'
import { assert, statusCreated, statusOk } from '../../common/assertions.js'
import { DEV, UAT, getBaseUrl } from '../../common/envs.js'
import { getFCList, getMerchantList } from '../../common/utils.js'
import { SharedArray } from 'k6/data'
import defaultHandleSummaryBuilder from '../../common/handleSummaryBuilder.js'
import {
    IDPAY_CONFIG,
    retrieveAndBuildIOAuthorizationHeader,
    idpayDefaultHeaders,
} from '../../common/idpay/envVars.js'
import { defaultApiOptionsBuilder } from '../../common/dynamicScenarios/defaultOptions.js'
import {
    getScenarioTestEntity,
    logErrorResult,
} from '../../common/dynamicScenarios/utils.js'

// Environments allowed to be tested
const REGISTERED_ENVS = [DEV, UAT]
const baseUrl = getBaseUrl(REGISTERED_ENVS, 'io') // api-io services baseUrl

// test tags
const application = 'idpay'
const testName = 'idpayPaymentDiscountAPI'

// Set up data for processing, share data among VUs
const cfList = new SharedArray('cfList', getFCList)
const merchantList = new SharedArray('merchantList', getMerchantList)

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

    // selecting current scenario/iteration test entity
    const cf = getScenarioTestEntity(cfList).FC
    const citizenParams = { headers: retrieveAndBuildIOAuthorizationHeader(cf) }

    const merchantFiscalCode = getScenarioTestEntity(merchantList).CF

    const merchantHeaders = Object.assign(
        {
            'x-merchant-fiscalcode': merchantFiscalCode,
            'x-acquirer-id': IDPAY_CONFIG.CONTEXT_DATA.acquirerId,
        },
        idpayDefaultHeaders,
        { 'Ocp-Apim-Subscription-Key': IDPAY_CONFIG.AUTH_KEYS.APIM_MIL_SK }
    )

    group('Create Transaction', () => {
        if (checked) {
            const params = {
                headers: merchantHeaders,
                body: {
                    initiativeId: IDPAY_CONFIG.CONTEXT_DATA.initiativeId,
                    idTrxAcquirer: `IDTRXACQUIRER${Math.floor(
                        Math.random() * (100 - 10 + 10) + 1
                    )}`,
                    amountCents: '100',
                    mcc: `MCC${Math.floor(
                        Math.random() * (100 - 10 + 10) + 1
                    )}`,
                },
            }

            const res = createTransaction(
                baseUrl,
                JSON.stringify(params.body),
                params
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
            const res = preAuth(baseUrl, trxCode, citizenParams)

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
            const res = authTrx(baseUrl, trxCode, citizenParams)

            assert(res, [statusOk()])
            if (res.status != 200) {
                logErrorResult('Auth', res, true)
                checked = false
                return
            }
        }
    })
}
