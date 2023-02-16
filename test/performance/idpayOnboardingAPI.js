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
import { isEnvValid, isTestEnabledOnEnv, DEV, UAT, PROD } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'
import { getFCList } from '../common/utils.js'
import {exec, vu} from 'k6/execution'
import { SharedArray } from 'k6/data'

const REGISTERED_ENVS = [DEV, UAT, PROD]

const services = JSON.parse(open('../../services/environments.json'))
let baseUrl
let myEnv
let init
let cfList = new SharedArray('cfList', function() {
    return getFCList()
})


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

export default () => {
    let checked = true
    const cf = auth(cfList[vu.idInTest-1].cf)


    if (
        !isEnvValid(__ENV.TARGET_ENV) ||
        !isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)
    ) {
        exec.test.abort()
    }


    if (checked){
        const serviceId = `${myEnv.SERVICE_ID}`
        const params = {
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Trace': 'true'
            }
        }
        const res = getInitiative(
            baseUrl,
            cf,
            serviceId,
            params
        )

        if(res.status != 200){
            console.error('GetInitiative -> '+JSON.stringify(res))
            checked = false
            return
        }
        assert(res,
            [statusOk()])

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
                assert(res, [statusNoContent()])
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