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
import { randomFiscalCode, getFCList } from '../common/utils.js'
import {exec, vu} from 'k6/execution'
import { SharedArray } from 'k6/data'

const REGISTERED_ENVS = [DEV]

const services = JSON.parse(open('../../services/environments.json'))
let baseUrl
let myEnv
//let fiscalCodeRandom = randomFiscalCode().toUpperCase()
let init
let cfList = new SharedArray('cfList', function() {
    return getFCList()
})


export let options = {
    scenarios: {
        ramping_arrival_rate: {
            executor: 'ramping-arrival-rate', //Number of VUs to pre-allocate before test start to preserve runtime resources
            timeUnit: '1s', //period of time to apply the iteration
            startRate: 100, //Number of iterations to execute each timeUnit period at test start.
            preAllocatedVUs: 1000,
            stages: [
                { duration: '1s', target: 5 },
                { duration: '3s', target: 300 },
                { duration: '1s', target: 5 },
            ]
        },
        /* contacts: {
            executor: 'constant-arrival-rate',
            duration: '30s',
            rate: 50,
            timeUnit: '1s',
            preAllocatedVUs: 500,
          }, */
        /* scenario_uno: {
            executor: 'per-vu-iterations',
            vus: 500,
            iterations: 1,
        },  */
          /*scenario_due: {
            executor: 'per-vu-iterations',
            vus: 500,
            iterations: 1,
            startTime: '60s',
            maxDuration: '600s',
        }, 
        scenario_tre: {
            executor: 'per-vu-iterations',
            vus: 3000,
            iterations: 1,
            startTime: '60s',
            maxDuration: '1000s',
        }, */ 
    },
    
     /* stages: [
        { duration: '5m', target: 50 }, // below normal load
        { duration: '8m', target: 50 },
        { duration: '5m', target: 100 }, // normal load
        { duration: '8m', target: 80 },
        { duration: '5m', target: 150 }, // around the breaking point
        { duration: '8m', target: 100 },
        { duration: '5m', target: 500 }, // beyond the breaking point
        { duration: '10m', target: 50 },
        { duration: '15m', target: 0 }, // scale down. Recovery stage.
        ], */

    /* thresholds: {
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
    const cf = auth(cfList[vu.idInTest-1].cf)


    if (
        !isEnvValid(DEV) ||
        !isTestEnabledOnEnv(DEV, REGISTERED_ENVS)
    ) {
        exec.test.abort()
    }

    /* const params = "01GNYFQQNXEMQJ23DPXMMJ4M5N"
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
    } */
            

    group('Should onboard Citizen', () => {

        group('When the inititive exists', () => {
            if(checked){
            
            const body = {
                initiativeId: '63b57edff2572314380204e5'
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
            const params = '63b57edff2572314380204e5'
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
                initiativeId: '63b57edff2572314380204e5'
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
                initiativeId: '63b57edff2572314380204e5',
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
