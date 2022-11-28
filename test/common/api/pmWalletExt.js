import http from 'k6/http'

const API_PREFIX = '/pm/wallet-ext/v1/external/walletv2'

export function getPaymentInstrumentList(baseUrl, params, fiscalCode) {
    const myParams = Object.assign({}, params)
    myParams.headers['Fiscal-Code'] = fiscalCode
    const res = http.get(`${baseUrl}${API_PREFIX}`, myParams)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}
