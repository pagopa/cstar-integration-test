import http from 'k6/http'

const API_PREFIX = '/ade'

export function downloadSenderAdeAckFile(baseUrl, filename, params) {
    const res = http.get(`${baseUrl}${API_PREFIX}/${filename}`, params)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}
