import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export function setStages(tempVus, durationStages, maxTarget){
    const arr = new Array()
    do {
        let r = randomIntBetween(1, maxTarget)
        let targetValue = tempVus<=r ? tempVus : r
        arr.push({duration: durationStages, target: targetValue})
        tempVus -= r
    }
    while(tempVus > 0)
    arr.push({duration: durationStages, target: 0})
    return arr;
}