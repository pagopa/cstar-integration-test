import { group } from 'k6'
import exec from 'k6/execution'
import {
    createCustomerTest,
    getCustomerTest,
    createCustomerBody,
} from './faHbCustomer.js'
import {
    putPaymentInstrumentCardTest,
    getPaymentInstrumentCardTest,
    deletePaymentInstrumentCardTest,
    createPaymentInstrumentBody,
    chooseRandomPanFromList,
} from './faHbPaymentInstruments.js'
import {
    putMerchantTest,
    getContractListByShopIdTest,
    createMerchantBody,
} from './faExtMerchant.js'
import { getTransactionListTest } from './faIoTransaction.js'
import { getProviderListTest } from './faExtProvider.js'
import {
    createTransactionBody,
    createTransactionTest,
    getTransactionTest,
} from './faRegisterTransaction.js'
import { getHashedPanTest } from './rtdGetHashedPans.js'
import { isEnvValid, isTestEnabledOnEnv, DEV, UAT } from '../common/envs.js'
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

    /*options.tlsAuth = [
        {
            domains: [baseUrl],
            cert: tlsCert,
            key: tlsKey,
        },
    ]*/

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

    // options.tlsAuth = undefined
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

        const customerBody = createCustomerBody()
        group('Should create a CUSTOMER', () =>
            createCustomerTest(baseUrl, params, customerBody)
        )
        group('Should get a CUSTOMER', () =>
            getCustomerTest(baseUrl, params, customerBody.id)
        )

        const pan = chooseRandomPanFromList(panList)
        const fiscalCode = customerBody.id // to use the same fiscal code of a customer already registered
        const piBody = createPaymentInstrumentBody(pan, fiscalCode)
        group('Should create a FA Payment Instrument', () => {
            putPaymentInstrumentCardTest(baseUrl, params, piBody)
        })
        group('Should get an FA Payment Instrument', () =>
            getPaymentInstrumentCardTest(baseUrl, params, pan, fiscalCode)
        )
        group('Should delete a FA Payment Instrument', () => {
            deletePaymentInstrumentCardTest(baseUrl, params, pan)
        })

        group('Should get provider list', () =>
            getProviderListTest(baseUrl, params)
        )

        const merchantBody = createMerchantBody()
        let shopId = ''
        group('Should put a merchant', () => {
            shopId = putMerchantTest(baseUrl, params, merchantBody)
        })
        group('Should get merchant contract list', () =>
            getContractListByShopIdTest(baseUrl, params, shopId)
        )

        let transactionId = ''
        const transactionBody = createTransactionBody()
        group('Should create a Transaction', () => {
            transactionId = createTransactionTest(
                baseUrl,
                params,
                transactionBody
            )
        })
        group('Should get a Transaction', () =>
            getTransactionTest(baseUrl, params, transactionId)
        )

        setRtdIssuerParameters()

        group('Should get hashed pans', () => getHashedPanTest(baseUrl, params))

        setIoParameters()

        group('Should get Transaction List', () =>
            getTransactionListTest(baseUrl, params, fiscalCode)
        )
    })
}
