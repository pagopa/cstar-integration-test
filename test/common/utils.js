import { randomString } from 'https://jslib.k6.io/k6-utils/1.1.0/index.js'

export function randomFiscalCode() {
    '^([A-Za-z]{6}[0-9lmnpqrstuvLMNPQRSTUV]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9lmnpqrstuvLMNPQRSTUV]{2}[A-Za-z]{1}[0-9lmnpqrstuvLMNPQRSTUV]{3}[A-Za-z]{1})$'

    const name = randomString(6)
    const birth_y = (40 + Math.floor(Math.random() * 50)).toString()
    const birth_m = 'M'
    let birth_d = Math.floor(Math.random() * 30).toString()
    if (birth_d.length == 1) {
        birth_d = `0${birth_d}`
    }
    const final = [
        randomString(1),
        (100 + Math.floor(Math.random() * 899)).toString(),
        randomString(1),
    ].join('')
    return [name, birth_y, birth_m, birth_d, final].join('')
}
