import http from 'k6/http'

const API_PREFIX = '/rtd/abi-to-fiscalcode'

export function getAbiToFiscalCodesMap(baseUrl, params) {
    const res = http.get(`${baseUrl}${API_PREFIX}/conversion-map`, params)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}