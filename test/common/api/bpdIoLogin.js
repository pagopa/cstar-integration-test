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

export function loginFullUrl(url, fiscalCode) {
    const myUrl = new URL(url)
    myUrl.searchParams.append('fiscalCode', fiscalCode)
    const res = http.post(myUrl.toString(), {})
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res.body
}

export function loginWithApiKey(baseUrl, rtdMockApiKey, fiscalCode) {
    const myUrl = new URL(`${baseUrl}/rtd/mock-io/login`)
    myUrl.searchParams.append('fiscalCode', fiscalCode)
    const res = http.post(myUrl.toString(), null, {
      headers: { 'Ocp-Apim-Subscription-Key': rtdMockApiKey }
    })
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function getMockedIoToken(baseUrl, rtdMockApiKey, fiscalCode) {
    return loginWithApiKey(baseUrl, rtdMockApiKey, fiscalCode).body
}

export function getUser(baseUrl, rtdMockApiKey, token) {
    const myUrl = new URL(`${baseUrl}/rtd/mock-io/user`)
    myUrl.searchParams.append('token', token)
    const res = http.get(myUrl.toString(), {
      headers: { 'Ocp-Apim-Subscription-Key': rtdMockApiKey }
    })
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}
