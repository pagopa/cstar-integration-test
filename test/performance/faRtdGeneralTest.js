import { group } from 'k6'
import exec from 'k6/execution'
import {
    assert,
    statusOk,
    statusNoContent,
    bodyLengthBetween,
} from '../common/assertions.js'
import { createCustomerBody } from './faHbCustomer.js'
import { getFaCustomer, putFaCustomer } from '../common/api/faHbCustomer.js'
import { createPaymentInstrumentBody } from './faHbPaymentInstruments.js'
import {
    getFAPaymentInstrument,
    putFAPaymentInstrumentCard,
    deleteFAPaymentInstrument,
} from '../common/api/faHbPaymentInstruments.js'
import {
    createMerchantBody,
    extractShopIdFromResponse,
} from './faExtMerchant.js'
import {
    getContractListByShopId,
    putMerchantByOther,
} from '../common/api/faExtMerchant.js'
import { getTransactionList } from '../common/api/faIoTransaction.js'
import { getProviderList } from '../common/api/faExtProvider.js'
import {
    getPosTransaction,
    createPosTransaction,
} from '../common/api/faRegisterTransaction.js'
import {
    createTransactionBody,
    extractTransactionId,
} from './faRegisterTransaction.js'
import { getHashedPan } from '../common/api/rtdPaymentInstrumentManager.js'
import { isEnvValid, isTestEnabledOnEnv, DEV, UAT } from '../common/envs.js'
import { chooseRandomPanFromList } from '../common/utils.js'
import dotenv from 'k6/x/dotenv'
import { login } from '../common/api/bpdIoLogin.js'

const REGISTERED_ENVS = [DEV, UAT]

const services = JSON.parse(open('../../services/environments.json'))

export let options = JSON.parse(open('../../options/constant_load.json'))

let params = {}
let baseUrl
let myEnv
let panList = []

let baseUrlIssuer
let baseUrlIo

if (isEnvValid(__ENV.TARGET_ENV)) {
    myEnv = dotenv.parse(open(`../../.env.${__ENV.TARGET_ENV}.local`))
    baseUrlIssuer = services[`${__ENV.TARGET_ENV}_issuer`].baseUrl
    baseUrlIo = services[`${__ENV.TARGET_ENV}_io`].baseUrl
    panList = JSON.parse(open('../../assets/encrypted_pan_list.json'))
    options.tlsAuth = [
        {
            domains: [baseUrl],
            cert: open(`../../certs/${myEnv.MAUTH_CERT_NAME}`),
            key: open(`../../certs/${myEnv.MAUTH_PRIVATE_KEY_NAME}`),
        },
    ]
}

function setIssuerParameters() {
    baseUrl = baseUrlIssuer

    params.headers = {
        'Ocp-Apim-Subscription-Key': myEnv.APIM_SK,
        'Ocp-Apim-Trace': 'true',
        'Content-Type': 'application/json',
    }
}

function setRtdIssuerParameters() {
    baseUrl = baseUrlIssuer
    params.headers = {
        'Ocp-Apim-Subscription-Key': myEnv.APIM_RTDPRODUCT_SK,
    }
}

function setIoParameters() {
    baseUrl = baseUrlIo

    const authToken = login(baseUrl, myEnv.FISCAL_CODE_EXISTING)
    params.headers = {
        Authorization: `Bearer ${authToken}`,
        'Ocp-Apim-Subscription-Key': `${
            myEnv.APIM_IO_SK || myEnv.APIM_SK
        };product=app-io-product`,
        'Ocp-Apim-Trace': 'true',
        'Content-Type': 'application/json',
    }
}

// In performance tests we shall use abort() to prevent the execution
// of the default function, otherwise the VUs will be spawned
if (!isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)) {
    console.log('Test not enabled for target env')
    exec.test.abort()
}

export default () => {
    group('FA RTD General load test', () => {
        setIssuerParameters()

        // fa hb customer
        const customerBody = createCustomerBody()
        group('Should create a CUSTOMER', () =>
            assert(putFaCustomer(baseUrl, params, customerBody), [statusOk()])
        )
        group('Should get a CUSTOMER', () =>
            assert(getFaCustomer(baseUrl, params, customerBody.id), [
                statusOk(),
            ])
        )

        // fa hb payment instruments
        const pan = chooseRandomPanFromList(panList)
        const fiscalCode = customerBody.id // to use the same fiscal code of a customer already registered
        const piBody = createPaymentInstrumentBody(pan, fiscalCode)
        group('Should create a FA Payment Instrument', () => {
            assert(putFAPaymentInstrumentCard(baseUrl, params, piBody), [
                statusOk(),
            ])
        })
        group('Should get an FA Payment Instrument', () =>
            assert(
                getFAPaymentInstrument(
                    baseUrl,
                    params,
                    pan.replace(/\n/g, '\\n'),
                    fiscalCode
                ),
                [statusOk()]
            )
        )
        group('Should delete a FA Payment Instrument', () => {
            assert(
                deleteFAPaymentInstrument(
                    baseUrl,
                    params,
                    pan.replace(/\n/g, '\\n')
                ),
                [statusNoContent()]
            )
        })

        // fa ext provider
        group('Should get provider list', () =>
            assert(getProviderList(baseUrl, params), [statusOk()])
        )

        // fa ext merchant
        const merchantBody = createMerchantBody()
        let shopId = ''
        group('Should put a merchant', () => {
            const putMerchantRes = putMerchantByOther(
                baseUrl,
                params,
                merchantBody
            )
            assert(putMerchantRes, [statusOk()])
            shopId = extractShopIdFromResponse(putMerchantRes)
        })
        group('Should get merchant contract list', () =>
            assert(getContractListByShopId(baseUrl, params, shopId), [
                statusOk(),
            ])
        )

        // fa register transaction
        let transactionId = ''
        const transactionBody = createTransactionBody()
        group('Should create a Transaction', () => {
            const createPosTransactionRes = createPosTransaction(
                baseUrl,
                params,
                transactionBody
            )
            assert(createPosTransactionRes, [statusOk()])
            transactionId = extractTransactionId(createPosTransactionRes)
        })
        group('Should get a Transaction', () =>
            assert(getPosTransaction(baseUrl, params, transactionId), [
                statusOk(),
            ])
        )

        setRtdIssuerParameters()

        // rtd get hashed pans
        group('Should get hashed pans', () =>
            assert(getHashedPan(baseUrl, params), [
                statusOk(),
                bodyLengthBetween(0, myEnv.RTD_HASHPAN_MAX_CONTENT_LENGTH),
            ])
        )

        setIoParameters()

        // fa io transaction
        group('Should get Transaction List', () =>
            assert(getTransactionList(baseUrl, params, fiscalCode), [
                statusOk(),
            ])
        )
    })
}
