import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js'
import http from 'k6/http'

const API_PREFIX = '/bpd/pagopa/api'

export function login(baseUrl, fiscalCode) {
    const myUrl = new URL(`${baseUrl}${API_PREFIX}/v1/login`)
    myUrl.searchParams.append('fiscalCode', fiscalCode)
    const res = http.post(myUrl.toString(), {})
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res.body
}
