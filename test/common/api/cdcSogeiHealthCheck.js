import http from 'k6/http'

const API_PREFIX = '/CDCUtenteWS/rest/unsecured/versione'

export function sogeiHealthCheck(baseUrl, params) {
    const myParams = Object.assign({}, params)
    const res = http.get(`${baseUrl}${API_PREFIX}`, myParams)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}
