import http from 'k6/http'

const API_PREFIX = '/bpd/io/citizen/v2'

export function GetCitizenWithOptInStatusNOREQ(baseUrl, params, fiscalCode) {
    const myParams = Object.assign({}, params)
    myParams.headers.id = fiscalCode
    return http.get(`${baseUrl}${API_PREFIX}`, myParams)
    // const isSuccessful = check(res, {
    //   'Status: HTTP Success': (r) => r.status === 200,
    //   'Body: Fiscal Code is OK': (r) => r.json().fiscalCode === fiscalCode,
    //   'Body: Citizen is Enabled': (r) => r.json().enabled === true,
    //   'Body: Citizen never received an OptIn request': (r) => r.json().optInStatus === 'NOREQ'
    // });
}

export function DeleteCitizen(baseUrl, params, fiscalCode) {
    const myParams = Object.assign({}, params)
    myParams.headers.id = fiscalCode
    myParams.headers['Content-Type'] = 'application/json'
    return http.del(`${baseUrl}${API_PREFIX}`, JSON.stringify({}), myParams)
    // const isSuccessful = check(res, {
    //   'Status: HTTP Success': (r) => r.status === 204
    // });
}

export function PutCitizenWithOptInStatusACCEPTED(baseUrl, params, fiscalCode) {
    const myParams = Object.assign({}, params)
    myParams.headers.id = fiscalCode
    myParams.headers['Content-Type'] = 'application/json'
    return http.put(
        `${baseUrl}${API_PREFIX}`,
        JSON.stringify({ optInStatus: 'ACCEPTED' }),
        myParams
    )
    // const isSuccessful = check(res, {
    //   'Status: HTTP Success': (r) => r.status === 200,
    //   'Body: Fiscal Code is OK': (r) => r.json().fiscalCode === fiscalCode,
    //   'Body: Citizen is Enabled': (r) => r.json().enabled === true,
    //   'Body: Citizen ACCEPTED OptIn': (r) => r.json().optInStatus === 'ACCEPTED'
    // });
}

export function PutCitizenWithOptInStatusDENIED(baseUrl, params, fiscalCode) {
    const myParams = Object.assign({}, params)
    myParams.headers.id = fiscalCode
    myParams.headers['Content-Type'] = 'application/json'
    return http.put(
        `${baseUrl}${API_PREFIX}`,
        JSON.stringify({ optInStatus: 'DENIED' }),
        myParams
    )
    // const isSuccessful = check(res, {
    //   'Status: HTTP Success': (r) => r.status === 200,
    //   'Body: Fiscal Code is OK': (r) => r.json().fiscalCode === fiscalCode,
    //   'Body: Citizen is Enabled': (r) => r.json().enabled === true,
    //   'Body: Citizen DENIED OptIn': (r) => r.json().optInStatus === 'DENIED'
    // });
}

export function PutCitizenWithOptInStatusNOREQAfterACCEPTED(
    baseUrl,
    params,
    fiscalCode
) {
    const myParams = Object.assign({}, params)
    myParams.headers.id = fiscalCode
    myParams.headers['Content-Type'] = 'application/json'
    return http.put(
        `${baseUrl}${API_PREFIX}`,
        JSON.stringify({ optInStatus: 'NOREQ' }),
        myParams
    )
    // const isSuccessful = check(res, {
    //   'Status: HTTP Success': (r) => r.status === 200,
    //   'Body: Fiscal Code is OK': (r) => r.json().fiscalCode === fiscalCode,
    //   'Body: Citizen is Enabled': (r) => r.json().enabled === true,
    //   'Body: Citizen ACCEPTED OptIn': (r) => r.json().optInStatus === 'ACCEPTED'
    // });
}

export function PutCitizenWithOptInStatusNOREQAfterDENIED(
    baseUrl,
    params,
    fiscalCode
) {
    const myParams = Object.assign({}, params)
    myParams.headers.id = fiscalCode
    myParams.headers['Content-Type'] = 'application/json'
    return http.put(
        `${baseUrl}${API_PREFIX}`,
        JSON.stringify({ optInStatus: 'NOREQ' }),
        myParams
    )
    // const isSuccessful = check(res, {
    //   'Status: HTTP Success': (r) => r.status === 200,
    //   'Body: Fiscal Code is OK': (r) => r.json().fiscalCode === fiscalCode,
    //   'Body: Citizen is Enabled': (r) => r.json().enabled === true,
    //   'Body: Citizen DENIED OptIn': (r) => r.json().optInStatus === 'DENIED'
    // });
}

export function PutCitizenWithoutOptInStatus(baseUrl, params, fiscalCode) {
    const myParams = Object.assign({}, params)
    myParams.headers.id = fiscalCode
    myParams.headers['Content-Type'] = 'application/json'
    return http.put(`${baseUrl}${API_PREFIX}`, JSON.stringify({}), myParams)
}
