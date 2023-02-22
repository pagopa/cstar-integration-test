import { group } from 'k6'
import { createRtdSas, putPgpFile } from '../common/api/rtdCsvTransaction.js'
import { assert, statusCreated } from '../common/assertions.js'
import {
    isEnvValid,
    isTestEnabledOnEnv,
    DEV,
    UAT,
    PROD,
} from '../common/envs.js'
import dotenv from 'k6/x/dotenv'

const REGISTERED_ENVS = [DEV, UAT, PROD]

const services = JSON.parse(open('../../services/environments.json'))

let params = {}
let param = {}
let baseUrl
let myEnv
let sas
let authorizedContainer
let gpgFile

export let options = {}
let fileName = `${myEnv.FILE_NAME}`


if (isEnvValid(__ENV.TARGET_ENV)) {
    myEnv = dotenv.parse(open(`../../.env.${__ENV.TARGET_ENV}.local`))
    baseUrl = services[`${__ENV.TARGET_ENV}_issuer`].baseUrl
    gpgFile = open(`../../assets/${fileName}`, 'b')

    options.tlsAuth = [
        {
            domains: [baseUrl],
            cert: open(`../../certs/${myEnv.MAUTH_CERT_NAME}`),
            key: open(`../../certs/${myEnv.MAUTH_PRIVATE_KEY_NAME}`),
        },
    ]

    params.headers = {
        'Ocp-Apim-Trace': 'true',
        'Ocp-Apim-Subscription-Key': myEnv.APIM_RTDPRODUCT_SK,
    }

    param.headers = {
        'Ocp-Apim-Subscription-Key': myEnv.APIM_RTDPRODUCT_SK,
        'x-ms-blob-type': 'BlockBlob',
        'x-ms-version': '2020-12-06',
        'Content-Type': 'text/csv'
    }
}

export default () => {
    if (
        !isEnvValid(__ENV.TARGET_ENV) ||
        !isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)
    ) {
        console.log('Test not enabled for target env')
        return
    }
    group('CSV Transaction API', () => {
        const res = createRtdSas(
            baseUrl, 
            params)

        assert(res,[statusCreated()])

        if(res.status==201){
        const bodyObj = JSON.parse(res.body)
        sas = bodyObj.sas
        authorizedContainer = bodyObj.authorizedContainer
        }else{
            console.error('Get Token SAS -> '+JSON.stringify(res))
            return
        }

        group('Should put file pgp', () =>{
            const rest = putPgpFile(
                baseUrl,
                gpgFile,
                param,
                authorizedContainer,
                fileName,
                sas)
                
            assert(rest, [statusCreated()])
            if(rest.status != 201){
                console.error('Put pgp file -> '+ JSON.stringify(rest))
            }
        })
    })
}
