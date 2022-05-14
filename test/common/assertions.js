import { check } from 'k6'

export function assert(res, assertions) {
    for (const assertion of assertions) {
        assertion(res)
    }
}

export function statusOk() {
    return function doCheck(res) {
        const isOk = check(res, {
            'HTTP status is 200': (r) => r.status === 200,
        })
    }
}

export function statusCreated() {
    return function doCheck(res) {
        check(res, { 'HTTP status is 201': (r) => r.status === 201 })
    }
}

export function statusNoContent() {
    return function doCheck(res) {
        check(res, { 'HTTP status is 204': (r) => r.status === 204 })
    }
}

export function statusForbidden() {
    return function doCheck(res) {
        check(res, { 'HTTP status is 401': (r) => r.status === 401 })
    }
}

export function statusConflict() {
    return function doCheck(res) {
        check(res, { 'HTTP status is 409': (r) => r.status === 409 })
    }
}

export function bodyLengthBetween(minLength, maxLength) {
    return function doCheck(res) {
        if (minLength > 0) {
            check(res, {
                'body size is more than or equal to minLength': (r) =>
                    r.body.length >= minLength,
            })
        }
        if (maxLength > 0) {
            check(res, {
                'body size is less than or equal to maxLength': (r) =>
                    r.body.length <= maxLength,
            })
        }
    }
}

export function bodyPgpPublicKey() {
    return function doCheck(res) {
        check(res, {
            'Response body contains PGP public key header': (r) =>
                r.body.includes('-----BEGIN PGP PUBLIC KEY BLOCK-----'),
        })
    }
}

export function bodyJsonSelectorValue(selector, expectedValue) {
    return function doCheck(res) {
        check(res, {
            'Response JSON contains value ': (r) =>
                r.json(selector) === expectedValue,
        })
    }
}

export function bodyJsonReduceArray(selector, reducer, initialState, expectedValue) {
    return function doCheck(res) {
        check(res, {
            'Response JSON contains an array which reduces to expected value ': (r) =>
                r.json(selector).reduce( reducer, initialState ) === expectedValue,
        })
    }
}