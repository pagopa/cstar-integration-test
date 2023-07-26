import { coalesce } from '../../utils.js'

/**
 * thresholdApiConfigs is an array containing:
 * - string element, in order to apply default thresholds to tagged api
 * - object element, in order to override default thresholds to tagged api. The object could contain the following properties:
 * -- apiName: api tag name, mandatory
 * -- maxAvgDurationMs: To override default maxAvgDurationMs
 * -- maxP90DurationMs: To override default maxP90DurationMs
 * -- maxP95DurationMs: To override default maxP95DurationMs
 * -- maxHttpReqFailedRate: To override default maxHttpReqFailedRate
 *
 **/
export default function buildThresholds(
    thresholdApiConfigs,
    maxAvgDurationMs,
    maxP90DurationMs,
    maxP95DurationMs
) {
    thresholdApiConfigs = coalesce(thresholdApiConfigs, [''])

    const httpReqDurationThresholds = thresholdApiConfigs
        .map((apiName) => {
            if (typeof apiName !== 'string') {
                maxAvgDurationMs = coalesce(apiName.maxAvgDurationMs)
                maxP90DurationMs = coalesce(apiName.maxP90DurationMs)
                maxP95DurationMs = coalesce(apiName.maxP95DurationMs)
                apiName = apiName.apiName
            }

            return buildHttpReqDurationThresholds(
                apiName !== '' ? `{apiName:${apiName}}` : '',
                maxAvgDurationMs,
                maxP90DurationMs,
                maxP95DurationMs
            )
        })
        .reduce((out, i) => Object.assign(out, i))

    const httpReqFailedThresholds = thresholdApiConfigs
        .map((apiName) => {
            if (typeof apiName !== 'string') {
                maxHttpReqFailedRate = coalesce(apiName.maxHttpReqFailedRate)
                apiName = apiName.apiName
            }

            return buildhttpReqFailedThresholds(
                apiName !== '' ? `{apiName:${apiName}}` : '',
                maxHttpReqFailedRate
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

function buildHttpReqDurationThresholds(
    apiSelector,
    maxAvgDurationMs,
    maxP90DurationMs,
    maxP95DurationMs
) {
    return {
        [`http_req_duration${apiSelector}`]: [
            {
                threshold: `avg<${maxAvgDurationMs}`, // the avg of requests should be below maxAvgDurationMs
                abortOnFail: false,
                delayAbortEval: '10s',
            },
            {
                threshold: `p(90)<${maxP90DurationMs}`, // 90% of requests should be below maxP90DurationMs
                abortOnFail: false,
                delayAbortEval: '10s',
            },
            {
                threshold: `p(95)<${maxP95DurationMs}`, // 95% of requests should be below maxP95DurationMs
                abortOnFail: false,
                delayAbortEval: '10s',
            },
        ],
    }
}

function buildhttpReqFailedThresholds(apiSelector, rate) {
    return {
        [`http_req_failed${apiSelector}`]: [
            {
                threshold: `rate<${rate}`,
                abortOnFail: false,
                delayAbortEval: '10s',
            },
        ],
    }
}
