import { coalesce } from '../../utils.js'
import { CONFIG } from '../envVars.js'

/**
 * thresholdApiConfigs is an array containing:
 * - string element, in order to apply defaultThresholdsConfig to tagged api
 * - object element, in order to override defaultThresholdsConfig to tagged api. The object could contain the following properties:
 * -- apiName: api tag name, mandatory
 *
 * defaultThresholdsConfig is an object containing optionally the following properties:
 * -- maxAvgDurationMs: To override default maxAvgDurationMs setted through ENV
 * -- maxP90DurationMs: To override default maxP90DurationMs setted through ENV
 * -- maxP95DurationMs: To override default maxP95DurationMs setted through ENV
 * -- maxHttpReqFailedRate: To override default maxHttpReqFailedRate setted through ENV
 *
 **/
export default function buildThresholds(
    thresholdApiConfigs,
    defaultThresholdsConfig
) {
    thresholdApiConfigs = coalesce(thresholdApiConfigs, [''])
    defaultThresholdsConfig = coalesce(defaultThresholdsConfig, {})

    const httpReqDurationThresholds = thresholdApiConfigs
        .map((apiName) => {
            const thresholdsConfig = Object.assign({}, defaultThresholdsConfig)

            if (typeof apiName !== 'string') {
                Object.assign(thresholdsConfig, apiName)
                apiName = apiName.apiName
            }

            return buildHttpReqDurationThresholds(
                apiName !== '' ? `{apiName:${apiName}}` : '',
                thresholdsConfig
            )
        })
        .reduce((out, i) => Object.assign(out, i))

    const httpReqFailedThresholds = thresholdApiConfigs
        .map((apiName) => {
            const thresholdsConfig = Object.assign({}, defaultThresholdsConfig)

            if (typeof apiName !== 'string') {
                Object.assign(thresholdsConfig, apiName)
                apiName = apiName.apiName
            }

            return buildhttpReqFailedThresholds(
                apiName !== '' ? `{apiName:${apiName}}` : '',
                thresholdsConfig
            )
        })
        .reduce((out, i) => Object.assign(out, i))

    return Object.assign(
        {
            checks: [
                {
                    threshold: 'rate==1', // pass all checks
                    abortOnFail: false,
                    delayAbortEval: '10s',
                },
            ],
        },
        httpReqFailedThresholds,
        httpReqDurationThresholds
    )
}

function buildHttpReqDurationThresholds(apiSelector, thresholdsConfig) {
    return {
        [`http_req_duration${apiSelector}`]: [
            {
                threshold: `avg<=${coalesce(
                    thresholdsConfig.maxAvgDurationMs,
                    CONFIG.THRESHOLDS.DURATIONS.AVG
                )}`, // the avg of requests should be below maxAvgDurationMs
                abortOnFail: false,
                delayAbortEval: '10s',
            },
            {
                threshold: `p(90)<=${coalesce(
                    thresholdsConfig.maxP90DurationMs,
                    CONFIG.THRESHOLDS.DURATIONS.P90
                )}`, // 90% of requests should be below maxP90DurationMs
                abortOnFail: false,
                delayAbortEval: '10s',
            },
            {
                threshold: `p(95)<=${coalesce(
                    thresholdsConfig.maxP95DurationMs,
                    CONFIG.THRESHOLDS.DURATIONS.P95
                )}`, // 95% of requests should be below maxP95DurationMs
                abortOnFail: false,
                delayAbortEval: '10s',
            },
        ],
    }
}

function buildhttpReqFailedThresholds(apiSelector, thresholdsConfig) {
    return {
        [`http_req_failed${apiSelector}`]: [
            {
                threshold: `rate<=${coalesce(
                    thresholdsConfig.maxHttpReqFailedRate,
                    CONFIG.THRESHOLDS.REQ_FAILED.RATE
                )}`,
                abortOnFail: false,
                delayAbortEval: '10s',
            },
        ],
    }
}
