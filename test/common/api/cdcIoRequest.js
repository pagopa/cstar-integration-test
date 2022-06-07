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
    const res = http.post(
        `${baseUrl}${API_PREFIX}/beneficiario/registrazione`,
        payload,
        myParams
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

// PRECONDITIONS: Fiscal Code has never requested any cards
// TEST PROCEDURE: A GET is performed then a post which requests cdc for all years returned by get.
// ASSERTION: a 200 OK status must be returned with OK for all years
export function happyCase(baseUrl, params) {
    const myParams = Object.assign({}, params)
    const getRes = http.get(
        `${baseUrl}${API_PREFIX}/beneficiario/stato`,
        myParams
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(getRes, null, 2))

    const payload = JSON.stringify({
        anniRif: getRes.json().listaStatoPerAnno.map((e) => {
            return { anno: e.annoRiferimento, dataIsee: e.annoRiferimento }
        }),
    })
    const postRes = http.post(
        `${baseUrl}${API_PREFIX}/beneficiario/registrazione`,
        payload,
        myParams
    )
    __ENV.REQ_DUMP === undefined ||
        console.log(JSON.stringify(postRes, null, 2))
    return postRes
}

// PRECONDITIONS: Fiscal Code has never requested any cards
// TEST PROCEDURE: A GET is performed then a post which requests cdc for
//  all years returned by get. dataIsee date isn't included in the paylod
// ASSERTION: a 200 OK status must be returned with OK for all years
export function happyCaseWithoutIseeDate(baseUrl, params) {
    const myParams = Object.assign({}, params)
    const getRes = http.get(
        `${baseUrl}${API_PREFIX}/beneficiario/stato`,
        myParams
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(getRes, null, 2))

    const payload = JSON.stringify({
        anniRif: getRes.json().listaStatoPerAnno.map((e) => {
            return { anno: e.annoRiferimento }
        }),
    })
    const postRes = http.post(
        `${baseUrl}${API_PREFIX}/beneficiario/registrazione`,
        payload,
        myParams
    )
    __ENV.REQ_DUMP === undefined ||
        console.log(JSON.stringify(postRes, null, 2))
    return postRes
}

// PRECONDITIONS: Fiscal Code has never requested any cards
// TEST PROCEDURE: A GET is performed then a post which requests cdc for
//  all years returned by get. dataIsee is sent as a full date
// ASSERTION: a 200 OK status must be returned with OK for all years
export function happyCaseWithIseeFullDate(baseUrl, params) {
    const myParams = Object.assign({}, params)
    const getRes = http.get(
        `${baseUrl}${API_PREFIX}/beneficiario/stato`,
        myParams
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(getRes, null, 2))

    const payload = JSON.stringify({
        anniRif: getRes.json().listaStatoPerAnno.map((e) => {
            return {
                anno: e.annoRiferimento,
                dataIsee: new Date(e.annoRiferimento, 11, 31),
            }
        }),
    })
    const postRes = http.post(
        `${baseUrl}${API_PREFIX}/beneficiario/registrazione`,
        payload,
        myParams
    )
    __ENV.REQ_DUMP === undefined ||
        console.log(JSON.stringify(postRes, null, 2))
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
    const firstGetRes = http.get(
        `${baseUrl}${API_PREFIX}/beneficiario/stato`,
        myParams
    )
    __ENV.REQ_DUMP === undefined ||
        console.log(JSON.stringify(firstGetRes, null, 2))

    const payload = JSON.stringify({
        anniRif: firstGetRes
            .json()
            .listaStatoPerAnno.map((e) => {
                return { anno: e.annoRiferimento, dataIsee: null }
            })
            .splice(0, 1),
    })
    const postRes = http.post(
        `${baseUrl}${API_PREFIX}/beneficiario/registrazione`,
        payload,
        myParams
    )
    __ENV.REQ_DUMP === undefined ||
        console.log(JSON.stringify(postRes, null, 2))

    const secondGetRes = http.get(
        `${baseUrl}${API_PREFIX}/beneficiario/stato`,
        myParams
    )
    __ENV.REQ_DUMP === undefined ||
        console.log(JSON.stringify(secondGetRes, null, 2))
    return secondGetRes
}

// PRECONDITIONS: Fiscal Code has never requested any cards
// TEST PROCEDURE: As a first step the GET is performed, then a POST which
//  requests cdc for a subset of years returned by get. The subset is a
//  singleton, so it has exactly one element.
//  As a second step, a new GET is performed and the card is requested
//  via POST for all admissible years.
// ASSERTION: a 200 OK status must be returned, with CIT_REGISTRATO for one year
//  and OK for remaining years
export function twoStepHappyCase(baseUrl, params) {
    const myParams = Object.assign({}, params)
    const firstGetRes = http.get(
        `${baseUrl}${API_PREFIX}/beneficiario/stato`,
        myParams
    )
    __ENV.REQ_DUMP === undefined ||
        console.log(JSON.stringify(firstGetRes, null, 2))

    const firstPayload = JSON.stringify({
        anniRif: firstGetRes
            .json()
            .listaStatoPerAnno.map((e) => {
                return { anno: e.annoRiferimento, dataIsee: null }
            })
            .splice(0, 1),
    })
    const firstPostRes = http.post(
        `${baseUrl}${API_PREFIX}/beneficiario/registrazione`,
        firstPayload,
        myParams
    )
    __ENV.REQ_DUMP === undefined ||
        console.log(JSON.stringify(firstPostRes, null, 2))

    const secondGetRes = http.get(
        `${baseUrl}${API_PREFIX}/beneficiario/stato`,
        myParams
    )
    __ENV.REQ_DUMP === undefined ||
        console.log(JSON.stringify(secondGetRes, null, 2))

    const secondPayload = JSON.stringify({
        anniRif: secondGetRes.json().listaStatoPerAnno.map((e) => {
            return { anno: e.annoRiferimento, dataIsee: null }
        }),
    })
    const secondPostRes = http.post(
        `${baseUrl}${API_PREFIX}/beneficiario/registrazione`,
        secondPayload,
        myParams
    )
    __ENV.REQ_DUMP === undefined ||
        console.log(JSON.stringify(secondPostRes, null, 2))

    return secondPostRes
}

// PRECONDITIONS: Fiscal Code has never requested any cards
// TEST PROCEDURE: A GET is performed, then a POST which requests cdc for a
//  subset of years returned by get. The subset is a singleton, so it has
//  exactly one element. At the end a couple of new POSTs are performed
// ASSERTION: responses to the two POSTs must be the same
export function postIdempotence(baseUrl, params) {
    const myParams = Object.assign({}, params)
    const firstGetRes = http.get(
        `${baseUrl}${API_PREFIX}/beneficiario/stato`,
        myParams
    )
    __ENV.REQ_DUMP === undefined ||
        console.log(JSON.stringify(firstGetRes, null, 2))

    const payload = JSON.stringify({
        anniRif: firstGetRes
            .json()
            .listaStatoPerAnno.map((e) => {
                return { anno: e.annoRiferimento, dataIsee: null }
            })
            .splice(0, 1),
    })
    const tmpPostRes = http.post(
        `${baseUrl}${API_PREFIX}/beneficiario/registrazione`,
        payload,
        myParams
    )
    __ENV.REQ_DUMP === undefined ||
        console.log(JSON.stringify(tmpPostRes, null, 2))

    const postRes = http.post(
        `${baseUrl}${API_PREFIX}/beneficiario/registrazione`,
        payload,
        myParams
    )
    __ENV.REQ_DUMP === undefined ||
        console.log(JSON.stringify(postRes, null, 2))

    const secondPostRes = http.post(
        `${baseUrl}${API_PREFIX}/beneficiario/registrazione`,
        payload,
        myParams
    )
    __ENV.REQ_DUMP === undefined ||
        console.log(JSON.stringify(secondPostRes, null, 2))
    return [postRes, secondPostRes]
}

// PRECONDITIONS: Fiscal Code has never requested any cards
// TEST PROCEDURE: A GET is performed, then a POST which requests cdc for a
//  subset of years returned by get. The subset is a singleton, so it has
//  exactly one element. At the end a couple of new GETs are performed
// ASSERTION: responses to the two GETs must be the same
export function getIdempotence(baseUrl, params) {
    const myParams = Object.assign({}, params)
    const firstGetRes = http.get(
        `${baseUrl}${API_PREFIX}/beneficiario/stato`,
        myParams
    )
    __ENV.REQ_DUMP === undefined ||
        console.log(JSON.stringify(firstGetRes, null, 2))

    const payload = JSON.stringify({
        anniRif: firstGetRes
            .json()
            .listaStatoPerAnno.map((e) => {
                return { anno: e.annoRiferimento, dataIsee: null }
            })
            .splice(0, 1),
    })
    const tmpPostRes = http.post(
        `${baseUrl}${API_PREFIX}/beneficiario/registrazione`,
        payload,
        myParams
    )
    __ENV.REQ_DUMP === undefined ||
        console.log(JSON.stringify(tmpPostRes, null, 2))

    const getRes = http.get(
        `${baseUrl}${API_PREFIX}/beneficiario/stato`,
        myParams
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(getRes, null, 2))

    const secondGetRes = http.get(
        `${baseUrl}${API_PREFIX}/beneficiario/stato`,
        myParams
    )
    __ENV.REQ_DUMP === undefined ||
        console.log(JSON.stringify(secondGetRes, null, 2))
    return [getRes, secondGetRes]
}

// PRECONDITIONS: Fiscal Code has never requested any cards
// TEST PROCEDURE: A post is performed with an empty list of years
// ASSERTION: a 400 BAD REQUEST status must be returned with LISTA_ANNI_VUOTA
export function failureCaseWithEmptyYearList(baseUrl, params) {
    const myParams = Object.assign({}, params)

    const payload = JSON.stringify({
        anniRif: [],
    })
    const postRes = http.post(
        `${baseUrl}${API_PREFIX}/beneficiario/registrazione`,
        payload,
        myParams
    )
    __ENV.REQ_DUMP === undefined ||
        console.log(JSON.stringify(postRes, null, 2))
    return postRes
}

// PRECONDITIONS: Fiscal Code has never requested any cards
// TEST PROCEDURE: A post is performed without payload
// ASSERTION: a 400 BAD REQUEST status must be returned with NO_INPUT
export function failureCaseWithNoInput(baseUrl, params) {
    const myParams = Object.assign({}, params)

    const payload = null
    const postRes = http.post(
        `${baseUrl}${API_PREFIX}/beneficiario/registrazione`,
        payload,
        myParams
    )
    __ENV.REQ_DUMP === undefined ||
        console.log(JSON.stringify(postRes, null, 2))
    return postRes
}

// PRECONDITIONS: Fiscal Code has never requested any cards
// TEST PROCEDURE: A GET is performed, then a POST which requests cdc for a
//  subset of years returned by get plus a wrong year.
// ASSERTION: a 400 BAD REQUEST  status must be returned with FORMATO_ANNI_ERRATO
export function failureWithWrongYear(baseUrl, params) {
    const myParams = Object.assign({}, params)
    const firstGetRes = http.get(
        `${baseUrl}${API_PREFIX}/beneficiario/stato`,
        myParams
    )
    __ENV.REQ_DUMP === undefined ||
        console.log(JSON.stringify(firstGetRes, null, 2))

    let myArray = firstGetRes
        .json()
        .listaStatoPerAnno.map((e) => {
            return { anno: e.annoRiferimento, dataIsee: null }
        })
        .splice(0, 1)
    myArray.push({ anno: '2023', dataIsee: null })

    const payload = JSON.stringify({
        anniRif: myArray,
    })
    const postRes = http.post(
        `${baseUrl}${API_PREFIX}/beneficiario/registrazione`,
        payload,
        myParams
    )
    __ENV.REQ_DUMP === undefined ||
        console.log(JSON.stringify(postRes, null, 2))

    return postRes
}

// PRECONDITIONS: Fiscal Code has never requested any cards
// TEST PROCEDURE: A GET is performed then a post which requests cdc for all
//  years returned by get plus another year
// ASSERTION: a 400 BAD REQUEST status must be returned with INPUT_SUPERIORE_AL_CONSENTITO
export function failureWithYearListTooLong(baseUrl, params) {
    const myParams = Object.assign({}, params)
    const getRes = http.get(
        `${baseUrl}${API_PREFIX}/beneficiario/stato`,
        myParams
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(getRes, null, 2))

    let myArray = getRes.json().listaStatoPerAnno.map((e) => {
        return { anno: e.annoRiferimento, dataIsee: e.annoRiferimento }
    })

    myArray.push({ anno: '2023', dataIsee: null })
    const payload = JSON.stringify({
        anniRif: myArray,
    })

    const postRes = http.post(
        `${baseUrl}${API_PREFIX}/beneficiario/registrazione`,
        payload,
        myParams
    )
    __ENV.REQ_DUMP === undefined ||
        console.log(JSON.stringify(postRes, null, 2))
    return postRes
}

// PRECONDITIONS: Fiscal Code has never requested any cards
// TEST PROCEDURE: A GET is performed then a post which requests cdc for all
//  years returned by get. One year is modified to have a wrong format
// ASSERTION: a 400 BAD REQUEST status must be returned with FORMATO_ANNI_ERRATO
export function failureWithGoodYearInWrongFormat(baseUrl, params) {
    const myParams = Object.assign({}, params)
    const getRes = http.get(
        `${baseUrl}${API_PREFIX}/beneficiario/stato`,
        myParams
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(getRes, null, 2))

    let myArray = getRes.json().listaStatoPerAnno.map((e) => {
        return { anno: e.annoRiferimento, dataIsee: e.annoRiferimento }
    })
    myArray[0] = {
        anno: myArray[0].anno + '/01/01',
        dataIsee: myArray[0].dataIsee,
    }

    const payload = JSON.stringify({
        anniRif: myArray,
    })

    const postRes = http.post(
        `${baseUrl}${API_PREFIX}/beneficiario/registrazione`,
        payload,
        myParams
    )
    __ENV.REQ_DUMP === undefined ||
        console.log(JSON.stringify(postRes, null, 2))
    return postRes
}

export function performanceHappyCase(baseUrl, params) {
    const myParams = Object.assign({}, params)
    http.get(`${baseUrl}${API_PREFIX}/beneficiario/stato`, myParams)
    http.get(`${baseUrl}${API_PREFIX}/beneficiario/stato`, myParams)
    const getRes = http.get(
        `${baseUrl}${API_PREFIX}/beneficiario/stato`,
        myParams
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(getRes, null, 2))

    const payload = JSON.stringify({
        anniRif: getRes.json().listaStatoPerAnno.map((e) => {
            return { anno: e.annoRiferimento, dataIsee: e.annoRiferimento }
        }),
    })
    http.post(
        `${baseUrl}${API_PREFIX}/beneficiario/registrazione`,
        payload,
        myParams
    )
    http.post(
        `${baseUrl}${API_PREFIX}/beneficiario/registrazione`,
        payload,
        myParams
    )
    const postRes = http.post(
        `${baseUrl}${API_PREFIX}/beneficiario/registrazione`,
        payload,
        myParams
    )
    __ENV.REQ_DUMP === undefined ||
        console.log(JSON.stringify(postRes, null, 2))
    return postRes
}
