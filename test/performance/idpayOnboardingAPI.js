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
import { randomFiscalCode, chooseRandomPanFromList } from '../common/utils.js'
import exec from 'k6/execution'


const REGISTERED_ENVS = [DEV]

const services = JSON.parse(open('../../services/environments.json'))
let baseUrl
let myEnv
let fiscalCodeRandom = randomFiscalCode().toUpperCase()
let init
let cfList = []

export let options = {
    scenarios: {
        per_vu_iterations: {
            executor: 'per-vu-iterations',
            vus: 100,
            iterations: 1,
            startTime: '0s',
            maxDuration: '300s',
        }, 
        per_vu_iterations_carico: {
            executor: 'per-vu-iterations',
            vus: 1000,
            iterations: 1,
            startTime: '60s',
            maxDuration: '600s',
        }, 
    },
    
    /* stages: [
        { duration: '1m', target: 3 },
        { duration: '3m', target: 6 },
        { duration: '1m', target: 3 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
    }, */
}

if (isEnvValid(DEV)) {
    myEnv = dotenv.parse(open(`../../env.dev.local`))
    baseUrl = services[`dev_io`].baseUrl
    //cfList = JSON.parse(open('../../assets/cf_onemb.csv'))
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
    const cf = auth(fiscalCodeRandom)
    //const cf = chooseRandomPanFromList(cfList)

    if (
        !isEnvValid(DEV) ||
        !isTestEnabledOnEnv(DEV, REGISTERED_ENVS)
    ) {
        exec.test.abort()
    }

    const params = "01GNYFQQNXEMQJ23DPXMMJ4M5N"
    if (checked){
        const res = getInitiative(
            baseUrl,
            cf,
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
                    cf
                )

                if(res.status != 204){
                    console.error('PutOnboardingCitizen -> '+JSON.stringify(res))
                    checked = false
                    return
                }
                
                assert(res,
                [statusNoContent()])
            }
  
        })
        group('When inititive exists', () => {
            if(checked){
            const params = init
            let res = getStatus(
                    baseUrl,
                    cf,
                    params
                )

            if(res.status != 200){
                console.error('GetStatus -> '+JSON.stringify(res))
                checked = false
                return
            }
            
            assert(res,
            [statusOk(),
            bodyJsonSelectorValue('status', 'ACCEPTED_TC')])
        }
        
        })

        group('When the TC consent exists', () => {
            if(checked){
            const body = {
                initiativeId: init
            }
                let res = putCheckPrerequisites(
                    baseUrl,
                    JSON.stringify(body),
                    cf
                )
            if(res.status != 200){
                console.error('PutCheckPrerequisites -> '+JSON.stringify(res))
                checked = false
                return
            }
            
            assert(res,
            [statusOk()])
            }
            
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
                    cf
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
