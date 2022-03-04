import http from 'k6/http'

const API_PREFIX = '/bpd/io/citizen/v2'

export function getCitizen(baseUrl, params, fiscalCode) {
    const myParams = Object.assign({}, params)
    myParams.headers.id = fiscalCode
    const res = http.get(`${baseUrl}${API_PREFIX}`, myParams)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function deleteCitizen(baseUrl, params, fiscalCode) {
    const myParams = Object.assign({}, params)
    myParams.headers.id = fiscalCode
    myParams.headers['Content-Type'] = 'application/json'
    const res = http.del(
        `${baseUrl}${API_PREFIX}`,
        JSON.stringify({}),
        myParams
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function putCitizen(baseUrl, params, body, fiscalCode) {
    const myParams = Object.assign({}, params)
    myParams.headers.id = fiscalCode
    myParams.headers['Content-Type'] = 'application/json'
    const res = http.put(
        `${baseUrl}${API_PREFIX}`,
        JSON.stringify(body),
        myParams
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}
