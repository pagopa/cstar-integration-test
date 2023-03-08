import {
    randomString,
    randomIntBetween,
} from 'https://jslib.k6.io/k6-utils/1.1.0/index.js'
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js'

export function randomFiscalCode() {
    '^([A-Za-z]{6}[0-9lmnpqrstuvLMNPQRSTUV]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9lmnpqrstuvLMNPQRSTUV]{2}[A-Za-z]{1}[0-9lmnpqrstuvLMNPQRSTUV]{3}[A-Za-z]{1})$'

    const name = randomString(6)
    const randDate = randomDate(new Date(1970, 0, 1), new Date(2000, 0, 1))
    const birth_y = randDate.getFullYear().toString().substring(2)
    const birth_m = getFiscalCodeMonth(randDate.getMonth() + 1)
    const isFemale = Math.random() < 0.5
    let birth_d = (randDate.getDay() + (isFemale ? 40 : 0) + 1).toString()
    birth_d = birth_d.length == 1 ? `0${birth_d}` : birth_d
    const final = [
        randomString(1),
        (100 + Math.floor(Math.random() * 899)).toString(),
        randomString(1),
    ].join('')
    return [name, birth_y, birth_m, birth_d, final].join('')
}

export function randomDate(start, end) {
    return new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
    )
}

export function randomVatNumber() {
    return randomIntBetween(10000000000, 99999999999)
}

export function chooseRandomPanFromList(panList) {
    const index = randomIntBetween(0, panList.list.length - 1)
    return panList.list[index]
}

export function getFCList() {
    return papaparse.parse(open(`${__ENV.FC_FILE}`), { header: true }).data;
}

export function getFCPanList() {
    return papaparse.parse(open(`${__ENV.FC_FILE}`), { header: true }).data;
}
export function getFCIbanList() {
    return papaparse.parse(open(`${__ENV.FC_IBAN_FILE}`), { header: true }).data;
}

function getFiscalCodeMonth(month) {
    const monthDict = {
        1: 'A',
        2: 'B',
        3: 'C',
        4: 'D',
        5: 'E',
        6: 'H',
        7: 'L',
        8: 'M',
        9: 'P',
        10: 'R',
        11: 'S',
        12: 'T',
    }
    return monthDict[month]
}
