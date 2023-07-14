import { CONFIG } from '../envVars.js'

export default {
    constantArrivalRate: {
        executor: 'constant-arrival-rate',
        duration: `${CONFIG.SCENARIOS.constantArrivalRate.DURATION}s`,
        rate: CONFIG.SCENARIOS.constantArrivalRate.RATE,
        timeUnit: `${CONFIG.SCENARIOS.constantArrivalRate.TIME_UNIT}s`,
        preAllocatedVUs: Math.ceil(0.01 * CONFIG.VIRTUAL_USERS),
        maxVUs: CONFIG.VIRTUAL_USERS,
    },
}
