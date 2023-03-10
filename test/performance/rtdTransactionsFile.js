import { group } from 'k6'
import { createRtdSas, putPgpFile } from '../common/api/rtdCsvTransaction.js'
import { assert, statusCreated } from '../common/assertions.js'
import {
    isEnvValid,
    isTestEnabledOnEnv,
    DEV,
    UAT,
    PROD,
} from '../common/envs.js'
import {exec} from 'k6/execution'
import { jUnit, textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';
import { setStages } from '../common/stageUtils.js';

const REGISTERED_ENVS = [DEV, UAT, PROD]

const services = JSON.parse(open('../../services/environments.json'))
const customStages = setStages(__ENV.VIRTUAL_USERS_ENV, __ENV.STAGE_NUMBER_ENV > 3 ? __ENV.STAGE_NUMBER_ENV : 3)

let params = {}
let param = {}
let baseUrl
let myEnv
let sas
let authorizedContainer
let gpgFile


let fileName = "CSTAR.IDPAY.TRNLOG.20230313.223000.001.01.csv.pgp"

let scenarios = {
    rampingArrivalRate: {
        executor: 'ramping-arrival-rate', //Number of VUs to pre-allocate before test start to preserve runtime resources
        timeUnit: '1s', //period of time to apply the iteration
        preAllocatedVUs: __ENV.VIRTUAL_USERS_ENV,
        maxVUs: __ENV.VIRTUAL_USERS_ENV,
        stages: customStages
    },
    perVuIterations: {
        executor: 'per-vu-iterations',
        vus: __ENV.VIRTUAL_USERS_ENV,
        iterations: 1,
        startTime: '0s',
        maxDuration: `${__ENV.DURATION_PER_VU_ITERATION}s`,
    },
};
export let options = {
    scenarios: {} ,
    thresholds: {
        http_req_failed: [{threshold:'rate<0.01', abortOnFail: false, delayAbortEval: '10s'},], // http errors should be less than 1%
        http_reqs: [{threshold: `count<=${parseInt(__ENV.VIRTUAL_USERS_ENV) * 2}`, abortOnFail: false, delayAbortEval: '10s'},]
    },

}

if (__ENV.SCENARIO_TYPE_ENV) {
    options.scenarios[__ENV.SCENARIO_TYPE_ENV] = scenarios[__ENV.SCENARIO_TYPE_ENV]; // Use just a single scenario if ` -e SCENARIO_TYPE_ENV` is used
} else {
    options.scenarios = scenarios; // Use all scenrios
}

if (isEnvValid(__ENV.TARGET_ENV)) {
    baseUrl = services[`${__ENV.TARGET_ENV}_issuer`].baseUrl
    gpgFile = open(`../../assets/${fileName}`, 'b')

    options.tlsAuth = [
        {
            domains: [baseUrl],
            cert: open(`../../certs/rtd-uat-acquirer-mauth.pem`),
            key: open(`../../certs/rtd-uat-acquirer-mauth.key`),
        },
    ]

    params.headers = {
        'Ocp-Apim-Trace': 'true',
        'Ocp-Apim-Subscription-Key': __ENV.APIM_SK,
    }

    param.headers = {
        'Ocp-Apim-Subscription-Key': __ENV.APIM_SK,
        'x-ms-blob-type': 'BlockBlob',
        'x-ms-version': '2020-12-06',
        'Content-Type': 'text/csv'
    }
}


export default () => {
    if (
        !isEnvValid(__ENV.TARGET_ENV) ||
        !isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)
    ) {
        exec.test.abort()
    }

    group('CSV Transaction API', () => {
        const res = createRtdSas(
            baseUrl, 
            params)

        assert(res,[statusCreated()])

        if(res.status==201){
        const bodyObj = JSON.parse(res.body)
        sas = bodyObj.sas
        authorizedContainer = bodyObj.authorizedContainer
        }else{
            console.error('Get Token SAS -> '+JSON.stringify(res))
            return
        }

        group('Should put file pgp', () =>{

            const rest = putPgpFile(
                baseUrl,
                gpgFile,
                param,
                authorizedContainer,
                fileName,
                sas)
                
            assert(rest, [statusCreated()])
            if(rest.status != 201){
                console.error('Put pgp file -> '+ JSON.stringify(rest))
            }
        })
    })
}

export function handleSummary(data){
    console.log(`TEST DETAILS: [Time to complete test: ${data.state.testRunDurationMs} ms, Environment target: ${__ENV.TARGET_ENV}, Scenario test type: ${__ENV.SCENARIO_TYPE_ENV}, Number of VUs: ${__ENV.VIRTUAL_USERS_ENV}, Request processed: ${data.metrics.http_reqs.values.count}, Request OK: ${data.metrics.http_req_failed.values.fails}, ERRORS: ${data.metrics.http_req_failed.values.passes}]`)
    if(__ENV.SCENARIO_TYPE_ENV == 'rampingArrivalRate'){
        let stringRamping = 'Ramping iterations for stage : { '
        for(let i=0; i<customStages.length-1; i++){
            stringRamping += `${customStages[i].target}, `
        }
        console.log(stringRamping+ `${customStages[customStages.length-1].target} } `)
    }
    return {
            'stdout': textSummary(data, { indent: ' ', enableColors: true}),
            './performancetest-result.xml': jUnit(data),
    }
}