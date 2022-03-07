import http from 'k6/http'

const API_PREFIX = '/rtd/payment-instrument-manager'

export function getHashedPan(baseUrl, params) {
    const res = http.get(`${baseUrl}${API_PREFIX}/hashed-pans`, params)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function getSalt(baseUrl, params) {
    const res = http.get(`${baseUrl}${API_PREFIX}/salt`, params)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}
