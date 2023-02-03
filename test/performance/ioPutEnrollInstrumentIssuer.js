import { group, sleep } from 'k6'
import { assert, statusOk} from '../common/assertions.js'
import {
    isEnvValid,
    isTestEnabledOnEnv,
    DEV,
    UAT,
    PROD,
} from '../common/envs.js'
import dotenv from 'k6/x/dotenv'
import {exec, vu} from 'k6/execution'
import {
    putEnrollInstrumentIssuer
   } from '../common/api/idpayWallet.js'
import { randomFiscalCode, getFCPanList } from '../common/utils.js'
import { SharedArray } from 'k6/data'



   let cfPanList = new SharedArray('cfPanList', function() {
    return getFCPanList()
})


const REGISTERED_ENVS = [DEV]

const services = JSON.parse(open('../../services/environments.json'))
export let options = {
    scenarios: {
        scenario_uno: {
            executor: 'per-vu-iterations',
            vus: 25,
            iterations: 1,
            startTime: '5s',
            maxDuration: '1m',
        },
        scenario_due: {
            executor: 'per-vu-iterations',
            vus: 25,
            iterations: 1,
            startTime: '15s',
            maxDuration: '1m',
        },
        /* scenario_tre: {
            executor: 'per-vu-iterations',
            vus: 25,
            iterations: 1,
            startTime: '30s',
            maxDuration: '1m',
        },
        scenario_quatro: {
            executor: 'per-vu-iterations',
            vus: 25,
            iterations: 1,
            startTime: '45s',
            maxDuration: '1m',
        } */


        /* per_vu_iterations: {
            executor: 'ramping-arrival-rate', //Number of VUs to pre-allocate before test start to preserve runtime resources
            timeUnit: '10s', //period of time to apply the iteration
            startRate: 10, //Number of iterations to execute each timeUnit period at test start.
            preAllocatedVUs: 50,
            stages: [
                { duration: '5s', target: 10 },
                { duration: '5s', target: 10 },
                { duration: '5s', target: 10 },
                { duration: '5s', target: 10 },
                
            ]
        
    } */
    }
    /* stages: [
        { duration: '1m', target: 1 }
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
    }, */
}
let baseUrl
let myEnv

if (isEnvValid(DEV)) {
    myEnv = dotenv.parse(open(`../../env.dev.issuer.local`))
    baseUrl = services[`dev_io`].baseUrl
}


// In performance tests we shall use abort() to prevent the execution
// of the default function, otherwise the VUs will be spawned
if (!isTestEnabledOnEnv(DEV, REGISTERED_ENVS)) {
    console.log('Test not enabled for target env')
    exec.test.abort()
}

export default () => {
    const cf = cfPanList[vu.idInTest-1].cf
    const pgpan = cfPanList[vu.idInTest-1].pan

    group('Payment Instrument API', () => {
        group('Should enroll pgpan', () =>{
        
        let initiativeId = '63d26bbc0e71e44bb08de293'
        const params= {
            headers:  { 
                'Content-Type' : 'application/json',
                'Ocp-Apim-Subscription-Key':`${myEnv.APIM_SK}`,
                'Ocp-Apim-Trace':'true',
                'Accept-Language':'it_IT',
                'Fiscal-Code': cf,
            },
            body: {
                "brand": "VISA",
                "type": "DEB",
                "pgpPan": pgpan,
                "expireMonth": "08",
                "expireYear": "2023",
                "issuerAbiCode": "03069",
                "holder": "TEST"
            }
        }
        
        let res = putEnrollInstrumentIssuer(
            baseUrl,
            JSON.stringify(params.body).replace(/\\\\/g, "\\"),
            params.headers,
            initiativeId)

        if(res.status != 200){
            console.error('Enrollment Carte-> '+JSON.stringify(res))
            return
        }

        assert(res,
            [statusOk()])
            
    })
    })
    sleep(1)

}
