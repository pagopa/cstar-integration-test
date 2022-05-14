import http from 'k6/http'


const API_PREFIX = '/cdc'

export function getCitizenStatus(baseUrl, params) {
    const myParams = Object.assign({}, params)
    const res = http.get(`${baseUrl}${API_PREFIX}/beneficiario/stato`, myParams)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}
export function postCdcRequest(baseUrl, payload, params) {
    const myParams = Object.assign({}, params)
    const res = http.post(`${baseUrl}${API_PREFIX}/beneficiario/registrazione`, payload, myParams)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

// PRECONDITIONS: Fiscal Code has never requested any cards
// TEST PROCEDURE: A GET is performed then a post which requests cdc for all years returned by get.
// ASSERTION: a 200 OK status must be returned with OK for all years 
export function happyCase(baseUrl, params) {
    const myParams = Object.assign({}, params)
    const getRes = http.get(`${baseUrl}${API_PREFIX}/beneficiario/stato`, myParams)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(getRes, null, 2))

    const payload = JSON.stringify({  
        anniRif: getRes.json().listaStatoPerAnno.map(e => { return { anno: e.annoRiferimento, dataIsee: null } })
    
    });
    const postRes = http.post(`${baseUrl}${API_PREFIX}/beneficiario/registrazione`, payload, myParams)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(postRes, null, 2))
    return postRes
}

// PRECONDITIONS: Fiscal Code has never requested any cards
// TEST PROCEDURE: A GET is performed, then a POST which requests cdc for a 
//  subset of years returned by get. The subset is a singleton, so it has
//  exactly one element. At the end a new GET is performed
// ASSERTION: a 200 OK status must be returned, but exactly one year must be 
//  in the state VALUTAZIONE
export function partialHappyCase(baseUrl, params) {
    const myParams = Object.assign({}, params)
    const firstGetRes = http.get(`${baseUrl}${API_PREFIX}/beneficiario/stato`, myParams)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(firstGetRes, null, 2))

    const payload = JSON.stringify({  
        anniRif: firstGetRes.json().listaStatoPerAnno.map(e => { return { anno: e.annoRiferimento, dataIsee: null } }).splice(0,1)
    });
    const postRes = http.post(`${baseUrl}${API_PREFIX}/beneficiario/registrazione`, payload, myParams)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(postRes, null, 2))

    const secondGetRes = http.get(`${baseUrl}${API_PREFIX}/beneficiario/stato`, myParams)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(secondGetRes, null, 2))
    return secondGetRes
}