import { coalesce } from '../utils.js'
import { CONFIG } from './envVars.js'
import buildScenarios from './scenarios/scenariosBuilder.js'
import buildThresholds from './thresholds/thresholdsBuilder.js'

function applyTags(options, tags) {
    return Object.assign({}, options, {
        tags,
    })
}

export const defaultApiOptions = buildOption(undefined, {
    maxAvgDurationMs: CONFIG.THRESHOLDS.AVG,
    maxP90DurationMs: CONFIG.THRESHOLDS.P90,
    maxP95DurationMs: CONFIG.THRESHOLDS.P95,
})

function buildOption(thresholdApiConfigs, defaultThresholdsConfig) {
    return {
        scenarios: buildScenarios(),
        thresholds: buildThresholds(
            thresholdApiConfigs,
            defaultThresholdsConfig
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
    defaultThresholdsConfig
) {
    return applyTags(
        buildOption(thresholdApiConfigs, defaultThresholdsConfig),
        {
            application,
            testName,
        }
    )
}
