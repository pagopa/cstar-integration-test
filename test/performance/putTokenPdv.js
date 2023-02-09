import { group, sleep } from 'k6'
import {
     upsertToken,
     upsertMockToken
    } from '../common/api/pdv.js'
import { assert, statusOk, } from '../common/assertions.js'
import { isEnvValid, DEV, UAT, PROD } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'
import { getFCList} from '../common/utils.js'
import {vu} from 'k6/execution'
import { SharedArray } from 'k6/data'

const REGISTERED_ENVS = [DEV, UAT, PROD]

let baseUrl
let myEnv
let cfList = new SharedArray('cfList', function() {
    return getFCList()
})


export let options = {
    scenarios: {
        per_vu_iterations: {
            executor: 'ramping-arrival-rate', //Number of VUs to pre-allocate before test start to preserve runtime resources
            timeUnit: '1s', //period of time to apply the iteration
            startRate: 10, //Number of iterations to execute each timeUnit period at test start.
            preAllocatedVUs: 500,
            stages: [
                { duration: '1s', target: 10 },
                { duration: '1s', target: 50 },
                { duration: '1s', target: 10 },
                { duration: '1s', target: 100 },
                { duration: '1s', target: 20 },
                { duration: '1s', target: 300 },
                { duration: '1s', target: 0 },
            ]
        } 
    
     /* scenarios: {
        scenario_uno: {
            executor: 'per-vu-iterations',
            vus: 500,
            iterations: 1,
            startTime: '0s',
            maxDuration: '600s',
        }, */
    } 
    
}

if (isEnvValid(__ENV.TARGET_ENV)) {
    myEnv = dotenv.parse(open(`../../.env.${__ENV.TARGET_ENV}.local`))
    baseUrl = services[`${__ENV.TARGET_ENV}_pdv`].baseUrl
}



export default () => {
    const uniqueCF = cfList[vu.idInTest-1].cf


    //UPSERT TOKEN     
    group('Should onboard Citizen', () => {
        group('When the inititive and consents exist', () => {
            
        const params= {
            headers:  { 
                'Content-Type' : 'application/json',
                'Ocp-Apim-Trace': 'true',
                'x-api-key':`${myEnv.APIM_SK}`,
            },
            body: {
                "pii": uniqueCF,
            }
        }

        let res = upsertToken(
            baseUrl,
            JSON.stringify(params.body),
            params
        )

        if(res.status != 200){
            console.error('ERROR-> '+JSON.stringify(res))
            return
        }

        assert(res,
            [statusOk()])
         
        })
    })

    //MOCK TOKEN
    /* group('Should pdv put a cf', () => {
        group('Returns a token', () => {
            
        const params= {
            headers:  { 
                'Content-Type' : 'application/json',
                'Ocp-Apim-Trace': 'true',
            },
            body: {
                "pii": uniqueCF,
            }
        }

        let res = upsertMockToken(
            JSON.stringify(params.body),
            params
        )

        if(res.status != 200){
            console.error('ERROR-> '+JSON.stringify(res))
            return
        }

        assert(res,
            [statusOk()])
         
        })
    }) */
    sleep(1)
}
