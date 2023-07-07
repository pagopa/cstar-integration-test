import { group, sleep } from 'k6'
import { assert, statusOk } from '../../common/assertions.js'
import { DEV, getBaseUrl } from '../../common/envs.js'

import { getWalletDetail } from '../../common/api/idpay/idPayWallet.js'
import { getFCPanList } from '../../common/utils.js'
import { SharedArray } from 'k6/data'
import {
    IDPAY_CONFIG,
    buildIOAuthorizationHeader,
    idpayDefaultHeaders,
} from '../../common/idpay/envVars.js'
import defaultHandleSummaryBuilder from '../../common/handleSummaryBuilder.js'
import { defaultApiOptionsBuilder } from '../../common/dynamicScenarios/defaultOptions.js'
import { getScenarioTestEntity } from '../../common/dynamicScenarios/utils.js'

const REGISTERED_ENVS = [DEV, UAT, PROD]
const baseUrl = getBaseUrl(REGISTERED_ENVS, 'io')

const application = 'idpay'
const testName = 'getWalletDetail'

// Set up data for processing, share data among VUs
const cfPanList = new SharedArray('cfPanList', getFCPanList)

// K6 configurations
export const options = defaultApiOptionsBuilder(application, testName)

export const handleSummary = defaultHandleSummaryBuilder(application, testName)

export default () => {
    const scenarioEntity = getScenarioTestEntity(cfPanList)
    const cf = scenarioEntity.cf

    group('Payment Instrument API', () => {
        group('Should enroll pgpan', () => {
            const params = {
                headers: idpayDefaultHeaders,
            }

            const res = getWalletDetail(
                baseUrl,
                params.headers,
                buildIOAuthorizationHeader(cf),
                IDPAY_CONFIG.CONTEXT_DATA.initiativeId
            )

            if (res.status != 200) {
                console.error('Enrollment Carte-> ' + JSON.stringify(res))
                return
            }

            assert(res, [statusOk()])
        })
    })
    sleep(1)
}