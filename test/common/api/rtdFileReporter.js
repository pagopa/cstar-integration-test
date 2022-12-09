import http from 'k6/http'

const API_PREFIX = '/rtd/file-reporter'

export function getFileReport(baseUrl, params) {
    const res = http.get(`${baseUrl}${API_PREFIX}/file-report`, params)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}
