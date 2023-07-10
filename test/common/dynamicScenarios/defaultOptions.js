import { coalesce } from '../utils.js'
import { CONFIG } from './envVars.js'
import buildScenarios from './scenarios/scenariosBuilder.js'
import buildThresholds from './thresholds/thresholdsBuilder.js'

function applyTags(options, tags) {
    return Object.assign({}, options, {
        tags,
    })
}

export const defaultApiOptions = buildOption(
    CONFIG.THRESHOLDS.AVG,
    CONFIG.THRESHOLDS.P90,
    CONFIG.THRESHOLDS.P95
)

function buildOption(thresholdAvg, thresholdP90, thresholdP95) {
    return {
        scenarios: buildScenarios(),
        thresholds: buildThresholds(thresholdAvg, thresholdP90, thresholdP95),
    }
}

export function defaultApiOptionsBuilder(
    application,
    testName,
    thresholdAvg,
    thresholdP90,
    thresholdP95
) {
    return applyTags(
        buildOption(
            coalesce(thresholdAvg, CONFIG.THRESHOLDS.AVG),
            coalesce(thresholdP90, CONFIG.THRESHOLDS.P90),
            coalesce(thresholdP95, CONFIG.THRESHOLDS.P95)
        ),
        {
            application,
            testName,
        }
    )
}
