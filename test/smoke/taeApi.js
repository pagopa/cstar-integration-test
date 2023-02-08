import { group } from 'k6'
import {
    assert,
    statusOk,
    statusForbidden,
    bodyJsonSelectorValue,
} from '../common/assertions.js'
import {
    isEnvValid,
    isTestEnabledOnEnv,
    DEV,
    UAT,
    PROD,
} from '../common/envs.js'
import dotenv from 'k6/x/dotenv'
import { getSenderAdeAckFileNameList } from '../common/api/rtdFileRegister.js'
import { downloadSenderAdeAckFile } from '../common/api/adeDownloadSenderAdeAck.js'
import { getAbiToFiscalCodesMap } from '../common/api/taeAbiToFiscalCodes.js'
import { getFileReport } from '../common/api/rtdFileReporter.js'

const REGISTERED_ENVS = [DEV, UAT, PROD]

const services = JSON.parse(open('../../services/environments.json'))
export let options = {}
let params = {}
let baseUrl
let myEnv

if (isEnvValid(__ENV.TARGET_ENV)) {
    myEnv = dotenv.parse(open(`../../.env.${__ENV.TARGET_ENV}.local`))
    baseUrl = services[`${__ENV.TARGET_ENV}_issuer`].baseUrl

    options.tlsAuth = [
        {
            domains: [baseUrl],
            cert: open(`../../certs/${myEnv.MAUTH_CERT_NAME}`),
            key: open(`../../certs/${myEnv.MAUTH_PRIVATE_KEY_NAME}`),
        },
    ]

    params.headers = {
        'Ocp-Apim-Subscription-Key': myEnv.APIM_RTDPRODUCT_SK,
        'Ocp-Apim-Trace': 'true',
    }
}

export default () => {
    if (
        !isEnvValid(__ENV.TARGET_ENV) ||
        !isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)
    ) {
        return
    }
    group('TAE API', () => {
        group('Should retrieve conversion map', () =>
            assert(getAbiToFiscalCodesMap(baseUrl, params), [statusOk()])
        )
        group('Should retrieve filename list', () => {
            assert(getSenderAdeAckFileNameList(baseUrl, params), [statusOk()])
        })
        group('Should retrieve sender ade ack file', () => {
            let res = getSenderAdeAckFileNameList(baseUrl, params)
            res.json('fileNameList').forEach((element) => {
                assert(downloadSenderAdeAckFile(baseUrl, element, params), [
                    statusOk(),
                ])
            })
        })
        group('Should retrieve file report', () => {
            console.log(params.headers['Ocp-Apim-Subscription-Key'])
            assert(getFileReport(baseUrl, params), [statusOk()])
        })
        group('Should not retrieve file report, missing API key association on Sender Auth', () => {
            params.headers['Ocp-Apim-Subscription-Key'] = myEnv.APIM_RTDPRODUCT_SK_UNREGISTERED_ON_SENDER_AUTH
            let res = getFileReport(baseUrl, params)
            assert(res, [statusForbidden()])
        })
    })
}
