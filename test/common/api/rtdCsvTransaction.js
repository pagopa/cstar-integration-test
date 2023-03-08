import http from 'k6/http'
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js'

const API_PREFIX = '/rtd/csv-transaction'

export function getPublicKey(baseUrl, params) {
    const res = http.get(`${baseUrl}${API_PREFIX}/publickey`, params)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function createAdeSas(baseUrl, params) {
    const res = http.post(
        `${baseUrl}${API_PREFIX}/ade/sas`,
        {}, // Empty payload
        params
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function createRtdSas(baseUrl, params) {
    const res = http.post(
        `${baseUrl}${API_PREFIX}/rtd/sas`,
        {}, // Empty payload
        params
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function putPgpFile(baseUrl, body, headers, authorizedContainer, fileName, sas) {
    const res = http.put(
        `${baseUrl}/pagopastorage/${authorizedContainer}/${fileName}?${sas}`,
        body,
        headers

        
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}
