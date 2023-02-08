import http from 'k6/http'

const API_PREFIX = '/rtd/payment-instrument-manager'

export function getHashedPan(
    baseUrl,
    params,
    { queryParams = undefined, version = undefined } = {}
) {
    const queryString = queryParams ? '?' + queryParams.toString() : ''
    console.log(
        `${getBaseUrlWithVersion(baseUrl, version)}${queryString}/hashed-pans`
    )
    const res = http.get(
        `${getBaseUrlWithVersion(baseUrl, version)}${queryString}/hashed-pans`,
        params
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function getSalt(baseUrl, params, version = undefined) {
    const res = http.get(
        `${getBaseUrlWithVersion(baseUrl, version)}/salt`,
        params
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

function getBaseUrlWithVersion(baseUrl, version = undefined) {
    const versionPath = version ? '/' + version : ''
    return `${baseUrl}${API_PREFIX}${versionPath}`
}
