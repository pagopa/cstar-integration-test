import buildScenarios from './scenarios/scenariosBuilder.js'
import buildThresholds from './thresholds/thresholdsBuilder.js'

function applyTags(options, tags) {
    return Object.assign({}, options, {
        tags,
    })
}

export const defaultApiOptions = buildOption()

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
 * To see how to use thresholdApiConfigs and defaultThresholdsConfig: {@link buildThresholds}
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
