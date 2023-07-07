import { CONFIG } from './envVars.js'
import buildScenarios from './scenarios/scenariosBuilder.js'
import buildThresholds from './thresholds/thresholdsBuilder.js'

function applyTags(options, tags) {
    return Object.assign({}, options, {
        tags,
    })
}

export const defaultApiOptions = {
    scenarios: buildScenarios(),
    thresholds: buildThresholds(
        CONFIG.THRESHOLDS.API.AVG,
        CONFIG.THRESHOLDS.API.P90,
        CONFIG.THRESHOLDS.API.P95
    ),
}

export function defaultApiOptionsBuilder(application, testName) {
    return applyTags(defaultApiOptions, { application, testName })
}
