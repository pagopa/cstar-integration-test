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

// A get is performed then a post which requests cdc for all years returned by get
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

// A get is performed then a post which requests cdc for a subset of years returned by get
// export function partialHappyCase(baseUrl, params) {
//     const myParams = Object.assign({}, params)
//     const getRes = http.get(`${baseUrl}${API_PREFIX}/beneficiario/stato`, myParams)
//     __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(getRes, null, 2))

//     const payload = JSON.stringify({  
//         anniRif: getRes.json().listaRegistratoBean.map(e => { return { annoRif: e.annoRif, annoIsee: null } }).pop()
    
//     });
//     const postRes = http.post(`${baseUrl}${API_PREFIX}/beneficiario/registrazione`, payload, myParams)
//     __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(postRes, null, 2))
//     return postRes
// }