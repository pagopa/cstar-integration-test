import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export function setStages(tempVus, stageNumber){
    const arr = new Array(stageNumber);
    for (let i = 0; i < stageNumber; i++) {
        if(i == stageNumber-1){
            arr[i] = {duration: '1s', target: 0}
        } else if(i == stageNumber-2) {
           arr[i] = {duration: '1s', target: tempVus}
           tempVus -= tempVus
        } else {
            let r = randomIntBetween(1, (tempVus/2)-1)
            arr[i] = {duration: '1s', target: r}
            tempVus -= r
        }
    }
    return arr;
}