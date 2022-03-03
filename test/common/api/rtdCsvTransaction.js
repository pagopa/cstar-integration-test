import http from 'k6/http'

const API_PREFIX = '/rtd/csv-transaction'

export function GetPublicKey(baseUrl, params) {
    return http.get(`${baseUrl}${API_PREFIX}/publickey`, params)
}

export function CreateAdeSas(baseUrl, params) {
    return http.post(
        `${baseUrl}${API_PREFIX}/ade/sas`,
        {}, // Empty payload
        params
    )
}

export function CreateRtdSas(baseUrl, params) {
    return http.post(
        `${baseUrl}${API_PREFIX}/rtd/sas`,
        {}, // Empty payload
        params
    )
}
