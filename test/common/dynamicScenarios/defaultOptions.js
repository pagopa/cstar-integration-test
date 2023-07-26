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
    undefined,
    CONFIG.THRESHOLDS.AVG,
    CONFIG.THRESHOLDS.P90,
    CONFIG.THRESHOLDS.P95
)

function buildOption(
    thresholdApiConfigs,
    thresholdAvg,
    thresholdP90,
    thresholdP95
) {
    return {
        scenarios: buildScenarios(),
        thresholds: buildThresholds(
            thresholdApiConfigs,
            thresholdAvg,
            thresholdP90,
            thresholdP95
        ),
    }
}

/**
 * To see how to use thresholdApiConfigs: {@link buildThresholds}
 **/
export function defaultApiOptionsBuilder(
    application,
    testName,
    thresholdApiConfigs,
    thresholdAvg,
    thresholdP90,
    thresholdP95
) {
    return applyTags(
        buildOption(
            thresholdApiConfigs,
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
