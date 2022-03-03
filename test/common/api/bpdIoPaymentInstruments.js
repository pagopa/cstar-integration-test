import http from 'k6/http'

const API_PREFIX = '/bpd/io/payment-instruments'

export function GetBpdIoPaymentInstrumentV1(
    baseUrl,
    params,
    paymentInstrumentId
) {
    return http.get(`${baseUrl}${API_PREFIX}/${paymentInstrumentId}`, params)
}
