import rampingArrivalRate from './rampingArrivalRate.js'
import rampingGrowingArrivalRate from './rampingGrowingArrivalRate.js'
import constantArrivalRate from './constantArrivalRate.js'
import perVuIterations from './perVuIterations.js'
import { CONFIG } from '../envVars.js'

export const scenarios = Object.assign(
    {},
    perVuIterations,
    constantArrivalRate,
    rampingArrivalRate,
    rampingGrowingArrivalRate
)

export default function buildScenarios() {
    if (CONFIG.SCENARIOS.TYPES.indexOf('ALL') === -1) {
        return Object.assign(
            {},
            CONFIG.SCENARIOS.TYPES.map((t) => ({ [t]: scenarios[t] }))
        )
    } else {
        return scenarios // Use all scenrios
    }
}
