import { group, sleep } from 'k6'
import {
     upsertToken
    } from '../common/api/pdv.js'
import { assert, statusOk, } from '../common/assertions.js'
import { isEnvValid, DEV } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'
import { getFCList } from '../common/utils.js'
import {exec, vu} from 'k6/execution'
import { SharedArray } from 'k6/data'

const REGISTERED_ENVS = [DEV]

let baseUrl
let myEnv
let cfList = new SharedArray('cfList', function() {
    return getFCList()
})

export let options = {
    scenarios: {
        per_vu_iterations: {
            executor: 'ramping-arrival-rate', //Number of VUs to pre-allocate before test start to preserve runtime resources
            timeUnit: '1m', //period of time to apply the iteration
            startRate: 100, //Number of iterations to execute each timeUnit period at test start.
            preAllocatedVUs: 500,
            stages: [
                { duration: '1m', target: 100 },
                { duration: '2m', target: 300 },
                { duration: '1m', target: 100 },
            ]
        } 
    }
    /* scenarios: {
        scenario_uno: {
            executor: 'per-vu-iterations',
            vus: 332,
            iterations: 1,
            startTime: '0s',
            maxDuration: '300s',
        },
        scenario_due: {
            executor: 'per-vu-iterations',
            vus: 334,
            iterations: 1,
            startTime: '1s',
            maxDuration: '300s',
        },
        scenario_tre: {
            executor: 'per-vu-iterations',
            vus: 334,
            iterations: 1,
            startTime: '2s',
            maxDuration: '300s',
        },
    } */
    
    /*stages: [
    { duration: '1m', target: 30 }, // below normal load
    { duration: '2m', target: 80 },
    { duration: '5m', target: 500 },
    ], 
     thresholds: {
        http_req_duration: ['p(95)<500'],
    },*/
}


if (isEnvValid(DEV)) {
    myEnv = dotenv.parse(open(`../../env.pdv.local`))
    baseUrl = 'https://api.uat.tokenizer.pdv.pagopa.it'
}



export default () => {
    const uniqueCF = cfList[vu.idInTest-1].cf

         
    group('Should onboard Citizen', () => {
        group('When the inititive and consents exist', () => {
            
        const params= {
            headers:  { 
                'Content-Type' : 'application/json',
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
    //sleep(1)
}
