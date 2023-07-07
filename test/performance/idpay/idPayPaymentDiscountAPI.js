import { group } from 'k6'
import {
    createTransaction,
    preAuth,
    authTrx,
} from '../../common/api/idpay/idPayPaymentDiscount.js'
import { assert, statusCreated, statusOk } from '../../common/assertions.js'
import { DEV, UAT, PROD, getBaseUrl } from '../../common/envs.js'
import { getFCList } from '../../common/utils.js'
import { SharedArray } from 'k6/data'
import defaultHandleSummaryBuilder from '../../common/handleSummaryBuilder.js'
import {
    IDPAY_CONFIG,
    buildIOAuthorizationHeader,
    idpayDefaultHeaders,
} from '../../common/idpay/envVars.js'
import { defaultApiOptionsBuilder } from '../../common/dynamicScenarios/defaultOptions.js'
import { getScenarioTestEntity } from '../../common/dynamicScenarios/utils.js'

const REGISTERED_ENVS = [DEV, UAT, PROD]
const baseUrl = getBaseUrl(REGISTERED_ENVS, 'io')

const application = 'idpay'
const testName = 'idpayPaymentDiscountAPI'

// Set up data for processing, share data among VUs
let cfList = new SharedArray('cfList', getFCList)

// K6 configurations
export const options = defaultApiOptionsBuilder(application, testName)

export const handleSummary = defaultHandleSummaryBuilder(application, testName)

export default () => {
    let checked = true

    const cf = getScenarioTestEntity(cfList).FC
    const citizenParams = { headers: buildIOAuthorizationHeader(cf) }
    const merchantHeaders = Object.assign(
        {
            'x-merchant-id': IDPAY_CONFIG.CONTEXT_DATA.merchantId,
            'x-acquirer-id': 'PAGOPA',
        },
        idpayDefaultHeaders
    )

    group('Create Transaction', () => {
        if (checked) {
            const params = {
                headers: merchantHeaders,
                body: {
                    initiativeId: IDPAY_CONFIG.CONTEXT_DATA.INITIATIVE_ID,
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
                console.error('Create Trx -> ' + JSON.stringify(res))
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
                console.error('preAuth -> ' + JSON.stringify(res))
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
                console.error('Auth -> ' + JSON.stringify(res))
                checked = false
                return
            }
        }
    })
}
