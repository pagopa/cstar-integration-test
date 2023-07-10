export default function buildThresholds(
    thresholdApiNames = [''],
    maxAvgDurationMs,
    maxP90DurationMs,
    maxP95DurationMs
) {
    const httpReqDurationThresholds = thresholdApiNames.map((apiName) =>
        buildHttpReqDurationThresholds(
            apiName !== '' ? `{apiName:${apiName}}` : '',
            maxAvgDurationMs,
            maxP90DurationMs,
            maxP95DurationMs
        )
    )

    return Object.assign(
        {
            checks: [
                {
                    threshold: 'rate==1', // pass all checks
                    abortOnFail: false,
                    delayAbortEval: '10s',
                },
            ],
            http_req_failed: [
                {
                    threshold: 'rate<0.05', // http errors should be less than 5%
                    abortOnFail: false,
                    delayAbortEval: '10s',
                },
            ],
        },
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
