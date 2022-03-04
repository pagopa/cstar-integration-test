import http from 'k6/http'

const API_PREFIX = '/bpd/io/payment-instruments'

export function getBpdIoPaymentInstrumentV1(
    baseUrl,
    params,
    paymentInstrumentId
) {
    const res = http.get(
        `${baseUrl}${API_PREFIX}/${paymentInstrumentId}`,
        params
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}
