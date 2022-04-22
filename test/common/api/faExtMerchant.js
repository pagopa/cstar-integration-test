import http from 'k6/http'
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js'

const API_PREFIX = '/fa/ext/merchant'

export function getContractListByShopId(baseUrl, params, shopId, registerCode) {
    const myParams = Object.assign({}, params)
    const url = new URL(`${baseUrl}${API_PREFIX}/shop/${shopId}/contract/list`)
    if (registerCode) {
        url.searchParams.append('registerCode', registerCode)
    }
    const res = http.get(url.toString(), myParams)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function putMerchantByOther(baseUrl, params, body) {
    const myParams = Object.assign({}, params)
    const res = http.put(
        `${baseUrl}${API_PREFIX}/other`,
        JSON.stringify(body),
        myParams
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}
