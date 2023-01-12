import { group, sleep } from 'k6'
import {
     putOnboardingCitizen,
     putCheckPrerequisites,
     getInitiative,
     getStatus,
     putSaveConsent
    } from '../common/api/idpayOnboardingCitizen.js'
import { loginFullUrl } from '../common/api/bpdIoLogin.js'
import { assert, statusNoContent, statusAccepted, statusOk, bodyJsonSelectorValue } from '../common/assertions.js'
import { isEnvValid, isTestEnabledOnEnv, DEV } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'
import { randomFiscalCode } from '../common/utils.js'
import exec from 'k6/execution'

const REGISTERED_ENVS = [DEV]

const services = JSON.parse(open('../../services/environments.json'))
let baseUrl
let myEnv
let fiscalCodeRandom = randomFiscalCode()
let init

export let options = {
    stages: [
        { duration: '2m', target: 10 }, // below normal load
    { duration: '5m', target: 10 },
    { duration: '2m', target: 20 }, // normal load
    { duration: '5m', target: 20 },
    { duration: '2m', target: 30 }, // around the breaking point
    { duration: '5m', target: 30 },
    { duration: '2m', target: 40 }, // beyond the breaking point
    { duration: '5m', target: 40 },
    { duration: '10m', target: 0 }, // scale down. Recovery stage.
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
    },
}

if (isEnvValid(DEV)) {
    myEnv = dotenv.parse(open(`../../env.dev.local`))
    baseUrl = services[`dev_io`].baseUrl
}


function auth(fiscalCode) {
    const authToken = loginFullUrl(
        `${baseUrl}/bpd/pagopa/api/v1/login`,
        fiscalCode
    )
    return {
        headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': `${myEnv.APIM_SK}`,
            'Ocp-Apim-Trace': 'true'
        },
    }
}

export default () => {
    let checked = true

    if (
        !isEnvValid(DEV) ||
        !isTestEnabledOnEnv(DEV, REGISTERED_ENVS)
    ) {

        return
    }

    const params = "01GNYFQQNXEMQJ23DPXMMJ4M5N"
    if (checked){
        const res = getInitiative(
            baseUrl,
            auth(fiscalCodeRandom),
            params
        )
        if(res.status != 200){
            console.error('GetInitiative -> '+JSON.stringify(res))
            checked = false
            return
        }
    
        const bodyObj = JSON.parse(res.body)
        init = bodyObj.initiativeId
    }
            

    group('Should onboard Citizen', () => {
        group('When the inititive exists', () => {
            if(checked){
            
            const body = {
                initiativeId: init
            }
            
                let res = putOnboardingCitizen(
                    baseUrl,
                    JSON.stringify(body),
                    auth(fiscalCodeRandom)
                )

                if(res.status != 204){
                    console.error('PutOnboardingCitizen -> '+JSON.stringify(res))
                    checked = false
                }
                
                assert(res,
                [statusNoContent()])
            }

            return
            
        })
        group('When inititive exists', () => {
            if(checked){
            const params = init
            let res = getStatus(
                    baseUrl,
                    auth(fiscalCodeRandom),
                    params
                )

            if(res.status != 200){
                console.error('GetStatus -> '+JSON.stringify(res))
                checked = false
            }
            
            assert(res,
            [statusOk(),
            bodyJsonSelectorValue('status', 'ACCEPTED_TC')])
        }
        return
        })

        group('When the TC consent exists', () => {
            if(checked){
            const body = {
                initiativeId: init
            }
                let res = putCheckPrerequisites(
                    baseUrl,
                    JSON.stringify(body),
                    auth(fiscalCodeRandom)
                )
            if(res.status != 200){
                console.error('PutCheckPrerequisites -> '+JSON.stringify(res))
                checked = false
            }
            
            assert(res,
            [statusOk()])
            }
            return
        })

        group('When the inititive and consents exist', () => {
            if(checked){
            const body = {
                initiativeId: init,
                pdndAccept: true,
                selfDeclarationList: []
            }
                let res = putSaveConsent(
                    baseUrl,
                    JSON.stringify(body),
                    auth(fiscalCodeRandom)
                )
            if(res.status != 202){
                console.error('PutSaveConsent -> '+JSON.stringify(res))
                checked = false
            }
            
            assert(res,
            [statusAccepted()])
            }
        })


    })
    sleep(1)
}
