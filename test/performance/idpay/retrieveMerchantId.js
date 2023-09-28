import { assert, statusOk } from '../../common/assertions.js'
import { SharedArray } from 'k6/data'
import { IDPAY_CONFIG } from '../../common/idpay/envVars.js'
import defaultHandleSummaryBuilder from '../../common/handleSummaryBuilder.js'
import { defaultApiOptionsBuilder } from '../../common/dynamicScenarios/defaultOptions.js'
import {
    getScenarioTestEntity,
    logErrorResult,
} from '../../common/dynamicScenarios/utils.js'
import {
    MERCHANT_API_NAMES,
    retrieveMerchantId,
} from '../../common/api/idpay/idpayMerchant.js'
import { getMerchantList } from '../../common/utils.js'
import { appendString, writeString } from '../../common/xk6/file.js'
import { CONFIG } from '../../common/dynamicScenarios/envVars.js'

const application = 'idpay'
const testName = 'retrieveMerchantId'

// Set up data for processing, share data among VUs
const merchantList = new SharedArray('merchantList', getMerchantList(CONFIG.MERCHANT_FILENAME))
const merchantIdListFilePath = 'assets/merchantIdList.csv'

export function setup() {
    writeString(merchantIdListFilePath, 'ID;ACQUIRER_ID;MERCHANT_FISCAL_CODE\n')
}

// Dynamic scenarios' K6 configuration
export const options = defaultApiOptionsBuilder(
    application,
    testName,
    [MERCHANT_API_NAMES.retrieveMerchantId] // applying apiName tags to thresholds
)

// K6 summary configuration
export const handleSummary = defaultHandleSummaryBuilder(application, testName)

export default () => {
    const merchantFiscalCode = getScenarioTestEntity(merchantList).CF

    const res = retrieveMerchantId(
        CONFIG.USE_INTERNAL_ACCESS_ENV,
        IDPAY_CONFIG.CONTEXT_DATA.acquirerId,
        merchantFiscalCode
    )

    assert(res, [statusOk()])
    if (res.status != 200) {
        logErrorResult(testName, res, true)
        return
    }
    appendString(
        merchantIdListFilePath,
        `${res.body};${IDPAY_CONFIG.CONTEXT_DATA.acquirerId};${merchantFiscalCode}\n`
    )
}
