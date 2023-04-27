import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export function setStages(tempVus, stageNumber) {
    const arr = new Array(stageNumber);
    for (let i = stageNumber - 1; i >= 0; i--) {
        if (i == stageNumber - 1) {
            arr[i] = { duration: '1s', target: 0 }
        } else if (i == 0) {
            arr[i] = { duration: '1s', target: tempVus }
            tempVus -= tempVus
        } else {
            let r = randomIntBetween(1, (tempVus / 2) - 1)
            arr[i] = { duration: '1s', target: r }
            tempVus -= r
        }
    }
    return arr;
}
export function setScenarios(vus, maxVus, startTime, maxDuration) {
    if (maxVus == 0) {
        let scenarios = {}
        let counter = 0
        do {
            let randomVus = randomIntBetween(1, vus/2)
            let actualVus = vus <= randomVus ? vus : randomVus
            getScenarios(counter, scenarios, actualVus, startTime, maxDuration)
            startTime = parseInt(startTime) + parseInt(maxDuration)
            counter++
            vus -= randomVus
        }
        while (vus > 0)
        return scenarios
    }
    if (maxVus > 0) {
        let scenarios = {}
        let counter = 0
        do {
            //random vus with a maximum number of vus
            let randomVus = randomIntBetween(1, maxVus)
            let actualVus = vus <= randomVus ? vus : randomVus
            getScenarios(counter, scenarios, actualVus, startTime, maxDuration)
            startTime = parseInt(startTime) + parseInt(maxDuration)
            counter++
            vus -= randomVus
        }
        while (vus > 0)
        return scenarios
    }
}

export function thresholds(virtualUsers){
    return {
        http_req_failed: [{ threshold: 'rate<0.05', abortOnFail: false, delayAbortEval: '10s' },],
        http_reqs: [{ threshold: `count<=${parseInt(virtualUsers) * 6}`, abortOnFail: false, delayAbortEval: '10s' },]
    }
}

function getScenarios(counter, scenarios, actualVus, startTime, maxDuration){
    const propertyName = `scenario_${counter}`
    return scenarios[propertyName] = {
            executor: 'per-vu-iterations',
            vus: actualVus,
            iterations: 1,
            startTime: `${startTime}s`,
            maxDuration: `${maxDuration}s`
      }
    
}

export function parameters(){
      return {
        'putTokenMockedPdv': ['param1', 'param2'],
        'putTokenPdv': ['param3', 'param4'],
        'idpayOnboardingAPI': ['param5', 'param6'],
        'ioPutEnrollInstrumentIssuer': ['param7', 'param8'],
        'ioPutEnrollIban': ['param9', 'param10'],
        'rtdTransactionsFile': ['param11', 'param12']
      }
}