import http from 'k6/http'

const API_PREFIX = '/fa/io/transaction'

export function getTransactionList(baseUrl, params, hpan) {
    const myParams = Object.assign({}, params)
    const url = new URL(`${baseUrl}${API_PREFIX}/list`)
    url.searchParams.append('hpan', hpan)
    const res = http.get(url.toString(), myParams)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function createTransaction(baseUrl, params, body) {
    const myParams = Object.assign({}, params)
    const res = http.post(
        `${baseUrl}${API_PREFIX}/pos/invoice/request`,
        JSON.stringify(body),
        myParams
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

/*
const body = {
    amount: 0,
    binCard: '',
    authCode: '',
    vatNumber: '',
    posType: '',
    terminalId: '',
    trxDate: '',
    contractId: ''
}
*/