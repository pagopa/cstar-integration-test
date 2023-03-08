import { group, sleep } from 'k6'
import { assert, statusOk} from '../common/assertions.js'
import {
    isEnvValid,
    isTestEnabledOnEnv,
    DEV,
    UAT,
    PROD,
} from '../common/envs.js'
import { loginFullUrl } from '../common/api/bpdIoLogin.js'
import dotenv from 'k6/x/dotenv'
import {exec, vu} from 'k6/execution'
import {putEnrollIban} from '../common/api/idpayWallet.js'
   import { getFCList, getFCIbanList } from '../common/utils.js'
   import { SharedArray } from 'k6/data'
   

let cfList = new SharedArray('cfList', function() {
    return getFCList()
})
let cfIbanList = new SharedArray('cfIbanList', function() {
    return getFCIbanList()
})
let baseUrl
let myEnv

const REGISTERED_ENVS = [DEV, UAT, PROD]

const services = JSON.parse(open('../../services/environments.json'))
export let options = {
    scenarios: {
        per_vu_iterations: {
            executor: 'ramping-arrival-rate', //Number of VUs to pre-allocate before test start to preserve runtime resources
            timeUnit: '10s', //period of time to apply the iteration
            startRate: 20, //Number of iterations to execute each timeUnit period at test start.
            preAllocatedVUs: 60,
            stages: [
                { duration: '5s', target: 10 },
                { duration: '5s', target: 10 },
                { duration: '5s', target: 10 },
                { duration: '5s', target: 10 },

            ]
        }
    }
}


if (isEnvValid(__ENV.TARGET_ENV)) {
    myEnv = dotenv.parse(open(`../../.env.${__ENV.TARGET_ENV}.local`))
    baseUrl = services[`${__ENV.TARGET_ENV}_io`].baseUrl
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


// In performance tests we shall use abort() to prevent the execution
// of the default function, otherwise the VUs will be spawned
if (!isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)) {
    console.log('Test not enabled for target env')
    exec.test.abort()
}


export default () => {
    const cf = auth(cfIbanList[vu.idInTest-1].cf)
    const iban = cfIbanList[vu.idInTest-1].iban

    group('Iban API', () => {
        group('Should enroll iban', () =>{

        let initiativeId = `${myEnv.INITIATIVE_ID}`
        let body= {
            "iban": iban,
            "description": `conto cointestato`
        }

        let res = putEnrollIban(
            baseUrl,
            initiativeId,
            cf,
            JSON.stringify(body))

        if(res.status != 200){
            console.error('Enrollment IBAN-> '+JSON.stringify(res))
            return
        }

        assert(res, [statusOk()])

        })
    })
    sleep(1)
}