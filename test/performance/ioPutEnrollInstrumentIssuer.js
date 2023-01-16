import { group, sleep } from 'k6'
import { getHashedPan } from '../common/api/rtdPaymentInstrumentManager.js'
import { assert, statusOk} from '../common/assertions.js'
import {
    isEnvValid,
    isTestEnabledOnEnv,
    DEV,
    UAT,
    PROD,
} from '../common/envs.js'
import dotenv from 'k6/x/dotenv'
import exec from 'k6/execution'
import {
    putEnrollInstrumentIssuer
   } from '../common/api/idpayWallet.js'



const REGISTERED_ENVS = [DEV]

const services = JSON.parse(open('../../services/environments.json'))
/*export let options = {
    stages: [
        { duration: '1m', target: 1 }
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
    },
}*/
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
    group('Payment Instrument API', () => {
        group('Should enroll pgpan', () =>{
        
        let initiativeId = '63b57edff2572314380204e5'
        const params= {
            headers:  { 
                'Content-Type' : 'application/json',
                'Ocp-Apim-Subscription-Key':`${myEnv.APIM_SK}`,
                'Ocp-Apim-Trace':'true',
                'Accept-Language':'it_IT',
                'Fiscal-Code':'hljomj92C44a851z'
            },
            body: {
                "brand": "VISA",
                "type": "DEB",
                "pgpPan": "-----BEGIN PGP MESSAGE-----\nVersion: Keybase OpenPGP v2.0.76\nComment: https://keybase.io/crypto\n\nwYwDKIChg0Ypf6cBA/wKADCsIXPFNhVwibTBL4+XxrMY8sxJiBcv59US8GHEqGSh\nGGMxR3cZWzj/3jbtaZigAHp327TsnOQ/nk65w9hvijO7JFQDwXI7KZEqTYrbCJNG\nLriIStYe8CQCEYdFtbKNwKR2BjC3h8BMpvY36pYaIKb4KWtVU/ISq0f93l4LjtJM\nAbyyDHyR6b4H4D7B7Gw1kN/XYPx3OsPZ5jZCLZBf/GeN8HKnJTneEMX11gureYKG\n0GKSzQSdEyPcAT0QBK0c4i149sLuAHXGb60nbQ==\n=yOAg\n-----END PGP MESSAGE-----\n",
                "expireMonth": "08",
                "expireYear": "2023",
                "issuerAbiCode": "03069",
                "holder": "TEST"
            }
        }

        let res = putEnrollInstrumentIssuer(
            baseUrl,
            JSON.stringify(params.body),
            params,
            initiativeId)

        if(res.status != 200){
            console.error('ERROR-> '+JSON.stringify(res))
            return
        }

        assert(res,
            [statusOk()])
            
    })
    })

}
