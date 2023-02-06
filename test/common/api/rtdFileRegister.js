import http from 'k6/http'

const API_PREFIX = '/rtd/file-register'

export function getSenderAdeAckFileNameList(baseUrl, params) {
    const res = http.get(`${baseUrl}${API_PREFIX}/sender-ade-ack`, params)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}
