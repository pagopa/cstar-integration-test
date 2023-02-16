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
    putEnrollIbanIssuer
   } from '../common/api/idpayWallet.js'
import { getFCIbanList } from '../common/utils.js'
import { SharedArray } from 'k6/data'

   let cfPanList = new SharedArray('cfPanList', function() {
    return getFCIbanList()
})


const REGISTERED_ENVS = [DEV, UAT, PROD]

const services = JSON.parse(open('../../services/environments.json'))
export let options = {
    scenarios: {
        per_vu_iterations: {
            executor: 'ramping-arrival-rate', //Number of VUs to pre-allocate before test start to preserve runtime resources
            timeUnit: '1s', //period of time to apply the iteration
            startRate: 100, //Number of iterations to execute each timeUnit period at test start.
            preAllocatedVUs: 500,
            stages: [
                { duration: '1s', target: 100 },
                { duration: '1s', target: 100 },
                { duration: '1s', target: 100 },
            ]
        }
    },
}
let baseUrl
let myEnv

if (isEnvValid(__ENV.TARGET_ENV)) {
    myEnv = dotenv.parse(open(`../../.env.${__ENV.TARGET_ENV}.local`))
    baseUrl = services[`${__ENV.TARGET_ENV}_io`].baseUrl
}


// In performance tests we shall use abort() to prevent the execution
// of the default function, otherwise the VUs will be spawned
if (!isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)) {
    console.log('Test not enabled for target env')
    exec.test.abort()
}

export default () => {
    const cf = cfPanList[vu.idInTest-1].cf
    const iban = cfPanList[vu.idInTest-1].iban

    group('Iban API', () => {
        group('Should enroll iban', () =>{

        let initiativeId = `${myEnv.INITIATIVE_ID}`
        const params= {
            headers:  {
                'Content-Type' : 'application/json',
                'Ocp-Apim-Subscription-Key':`${myEnv.APIM_SK}`,
                'Ocp-Apim-Trace':'true',
                'Accept-Language':'it_IT',
                'Fiscal-Code': cf,
            },
            body: {
                "iban": iban,
                "description": `conto cointestato`
            }
        }

        let res = putEnrollIbanIssuer(
            baseUrl,
            JSON.stringify(params.body),
            params.headers,
            initiativeId)

        if(res.status != 200){
            console.error('Enrollment IBAN-> '+JSON.stringify(res))
            return
        }

        assert(res,
            [statusOk()])

    })
    })
    sleep(1)

}