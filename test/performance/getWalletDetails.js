import { group, sleep } from 'k6'
import { assert, statusOk} from '../common/assertions.js'
import {
    isEnvValid,
    isTestEnabledOnEnv,
    DEV
} from '../common/envs.js'
import dotenv from 'k6/x/dotenv'
import {exec, vu} from 'k6/execution'
import {
    getWalletDetail
   } from '../common/api/idpayWallet.js'
import { randomFiscalCode, getFCPanList } from '../common/utils.js'
import { SharedArray } from 'k6/data'
import { loginFullUrl } from '../common/api/bpdIoLogin.js'



   let cfPanList = new SharedArray('cfPanList', function() {
    return getFCPanList()
})


const REGISTERED_ENVS = [DEV]

const services = JSON.parse(open('../../services/environments.json'))
export let options = {
    scenarios: {
        scenario_uno: {
            executor: 'per-vu-iterations',
            vus: 100,
            iterations: 1,
            startTime: '0s',
            maxDuration: '1s',
        },
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
if (!isTestEnabledOnEnv(DEV, REGISTERED_ENVS)) {
    console.log('Test not enabled for target env')
    exec.test.abort()
}

export default () => {
    const cf = cfPanList[vu.idInTest-1].cf

    group('Payment Instrument API', () => {
        group('Should enroll pgpan', () =>{
        
        let initiativeId = '63d26bbc0e71e44bb08de293'
        const params= {
            headers:  { 
                'Content-Type' : 'application/json',
                'Ocp-Apim-Subscription-Key':`${myEnv.APIM_SK}`,
                'Ocp-Apim-Trace':'true',
                'Accept-Language':'it_IT',
            },
        }
        
        let res = getWalletDetail(
            baseUrl,
            params.headers,
            auth(cf),
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
