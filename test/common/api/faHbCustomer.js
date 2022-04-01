import http from 'k6/http'

const API_PREFIX = '/fa/hb/customer'

export function getFaCustomer(baseUrl, params, id, xRequestId) {
    const myParams = Object.assign({}, params)
    myParams.headers.id = id
    if (xRequestId) {
        myParams.headers['x-request-id'] = xRequestId
    }
    const res = http.get(`${baseUrl}${API_PREFIX}`, myParams)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function putFaCustomer(baseUrl, params, body) {
    const myParams = Object.assign({}, params)
    const res = http.put(
        `${baseUrl}${API_PREFIX}`,
        JSON.stringify(body),
        myParams
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function getFaCustomerInternal(baseUrl, params, id) {
    const myParams = Object.assign({}, params)
    const apiPrefix = '/famscustomer/fa/customer'
    const url = `${baseUrl}${apiPrefix}/${id}`
    myParams.headers.id = id
    const res = http.get(url, myParams)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function putFaCustomerInternal(baseUrl, params, body) {
    const myParams = Object.assign({}, params)
    const apiPrefix = '/famsenrollment/fa/enrollment/customer'
    const url = `${baseUrl}${apiPrefix}/${body.id}`
    const res = http.put(
        url,
        JSON.stringify(body),
        myParams
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}