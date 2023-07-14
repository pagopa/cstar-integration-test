import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js'
import { CONFIG } from '../envVars.js'

const scenarioRampCustomStages = setStages(
    CONFIG.SCENARIOS.RAMPS.STAGE_SECONDS_DURATION,
    CONFIG.SCENARIOS.RAMPS.STAGES_NUMBER,
    CONFIG.VIRTUAL_USERS
)

export default {
    rampingArrivalRate: {
        executor: 'ramping-arrival-rate', //Number of VUs to pre-allocate before test start to preserve runtime resources
        timeUnit: `${CONFIG.SCENARIOS.RAMPS.STAGE_SECONDS_DURATION}s`, //period of time to apply the iteration
        preAllocatedVUs: Math.ceil(0.01 * CONFIG.VIRTUAL_USERS),
        maxVUs: CONFIG.VIRTUAL_USERS,
        stages: scenarioRampCustomStages,
    },
}

function setStages(timeUnit, stageNumber, maxStageVu) {
    const arr = new Array(stageNumber)
    for (let i = 0; i < stageNumber; i++) {
        let stageVu
        if (i == stageNumber - 1) {
            stageVu = 0
        } else {
            stageVu = randomIntBetween(1, maxStageVu)
        }
        arr[i] = { duration: `${timeUnit}s`, target: stageVu }
    }
    return arr
}
