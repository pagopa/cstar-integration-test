import http from 'k6/http'

const API_PREFIX = '/rtd/payment-instrument-manager'

export function GetHashedPan(baseUrl, params) {
    return http.get(`${baseUrl}${API_PREFIX}/hashed-pans`, params)
}

export function GetSalt(baseUrl, params) {
    return http.get(`${baseUrl}${API_PREFIX}/salt`, params)
}
