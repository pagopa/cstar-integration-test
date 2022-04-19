import http from 'k6/http'

const API_PREFIX = '/fa/hb/payment-instruments'

export function getFAPaymentInstrument(baseUrl, params, id, fiscalCode) {
    const myParams = Object.assign({}, params)
    myParams.headers.id = id
    myParams.headers.fiscalCode = fiscalCode
    const res = http.get(`${baseUrl}${API_PREFIX}`, myParams)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function putFAPaymentInstrumentCard(baseUrl, params, body) {
    const myParams = Object.assign({}, params)
    const res = http.put(
        `${baseUrl}${API_PREFIX}/card`,
        JSON.stringify(body),
        myParams
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function patchFAPaymentInstrument(baseUrl, params, body) {
    const myParams = Object.assign({}, params)
    const res = http.patch(
        `${baseUrl}${API_PREFIX}`,
        JSON.stringify(body),
        myParams
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function deleteFAPaymentInstrument(baseUrl, params, id) {
    const myParams = Object.assign({}, params)
    myParams.headers.id = id
    const res = http.del(`${baseUrl}${API_PREFIX}`, {}, myParams)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}
