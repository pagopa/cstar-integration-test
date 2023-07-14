import { CONFIG } from '../envVars.js'

export default {
    constantArrivalRate: {
        executor: 'constant-arrival-rate',
        duration: `${CONFIG.SCENARIOS.constantArrivalRate.DURATION}s`,
        rate: CONFIG.SCENARIOS.constantArrivalRate.RATE,
        timeUnit: `${CONFIG.SCENARIOS.constantArrivalRate.TIME_UNIT}s`,
        preAllocatedVUs: CONFIG.VIRTUAL_USERS,
        maxVUs: Math.min(CONFIG.VIRTUAL_USERS * 2, 500),
    },
}
