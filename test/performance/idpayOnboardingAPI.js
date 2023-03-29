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
import { getFCList } from '../common/utils.js'
import {exec, vu} from 'k6/execution'
import { SharedArray } from 'k6/data'
import { jUnit, textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';
import { setStages, setScenarios } from '../common/stageUtils.js';

const REGISTERED_ENVS = [DEV, UAT, PROD]

const services = JSON.parse(open('../../services/environments.json'))
let baseUrl
let init
let cfList = new SharedArray('cfList', function() {
    return getFCList()
})

//const customStages = setStages(__ENV.VIRTUAL_USERS_ENV, __ENV.STAGE_NUMBER_ENV > 3 ? __ENV.STAGE_NUMBER_ENV : 3)
const scenarios = setScenarios(__ENV.VIRTUAL_USERS_ENV, __ENV.VUS_MAX_ENV, __ENV.START_TIME_ENV, __ENV.DURATION_PER_VU_ITERATION)

export let options = {
    scenarios: {},
    thresholds: {
        http_req_failed: [{threshold:'rate<0.05', abortOnFail: false, delayAbortEval: '10s'},], // http errors should be less than 1%
        http_reqs: [{threshold: `count<=${parseInt(__ENV.VIRTUAL_USERS_ENV) * 6}`, abortOnFail: false, delayAbortEval: '10s'},]
    },

}
const scenarioNames = Object.keys(scenarios)

if (__ENV.SCENARIO_TYPE_ENV=='vuIterations') {
    options.scenarios = scenarios;
} else {
    if (scenarioNames.includes(__ENV.SCENARIO_TYPE_ENV)) {
        options.scenarios[__ENV.SCENARIO_TYPE_ENV] = scenarios[__ENV.SCENARIO_TYPE_ENV];
    } else {
        console.log(`Scenario ${__ENV.SCENARIO_TYPE_ENV} not found`);
    }
}

//if (__ENV.SCENARIO_TYPE_ENV) {
//    options.scenarios[__ENV.SCENARIO_TYPE_ENV] = scenarios[__ENV.SCENARIO_TYPE_ENV]; // Use just a single scenario if ` -e SCENARIO_TYPE_ENV` is used
//} else {
//    options.scenarios = scenarios; // Use all scenrios
//}

if (isEnvValid(__ENV.TARGET_ENV)) {
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
            'Ocp-Apim-Subscription-Key': `${__ENV.APIM_SK}`,
            'Ocp-Apim-Trace': 'true'
        },
    }
}

export default () => {
    let checked = true
    const cf = auth(cfList[vu.idInTest-1].FC)

    if (
        !isEnvValid(__ENV.TARGET_ENV) ||
        !isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)
    ) {
        exec.test.abort()
    }

    if (checked){
        const serviceId = `${__ENV.SERVICE_ID}`
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

        group('When the inititive exists, put t&c', () => {
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
        group('Check accepted status', () => {
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

        group('When the TC consent exists, check the prerequisites', () => {
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

        group('When the inititive and consents exist, save consent', () => {
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

//export function handleSummary(data){
//    console.log(`TEST DETAILS: [Time to complete test: ${data.state.testRunDurationMs} ms, Environment target: ${__ENV.TARGET_ENV}, Scenario test type: ${__ENV.SCENARIO_TYPE_ENV}, Number of VUs: ${__ENV.VIRTUAL_USERS_ENV}, Request processed: ${data.metrics.http_reqs.values.count}, Request OK: ${data.metrics.http_req_failed.values.fails}, ERRORS: ${data.metrics.http_req_failed.values.passes}]`)
//    if(__ENV.SCENARIO_TYPE_ENV == 'rampingArrivalRate'){
//        let stringRamping = 'Ramping iterations for stage : { '
//        for(let i=0; i<customStages.length-1; i++){
//            stringRamping += `${customStages[i].target}, `
//        }
//        console.log(stringRamping+ `${customStages[customStages.length-1].target} } `)
//    }
//    return {
//            'stdout': textSummary(data, { indent: ' ', enableColors: true}),
//            './performancetest-result.xml': jUnit(data),
//    }
//}
