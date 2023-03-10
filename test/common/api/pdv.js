import http from 'k6/http'

export function upsertToken(baseUrl, body, headers) {
    const res = http.put(
        `${baseUrl}/tokenizer/v1/tokens`,
        body,
        headers
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function getToken(baseUrl, userId, headers) {
    const res = http.get(
        `${baseUrl}/tokens/${userId}/pii`,
        headers
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function upsertMockToken(baseUrl, body, headers) {
    const res = http.put(
        `${baseUrl}/mock/pdv/tokens`,
        body,
        headers
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

