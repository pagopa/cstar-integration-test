import http from 'k6/http'

const API_PREFIX = '/rtd/csv-transaction-decrypted'

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
