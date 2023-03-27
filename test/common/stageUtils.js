import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export function setStages(tempVus, stageNumber){
    const arr = new Array(stageNumber);
    for (let i = stageNumber-1; i >= 0; i--) {
        if(i == stageNumber-1){
            arr[i] = {duration: '1s', target: 0}
        } else if(i == 0) {
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
export function setScenarios(vus, maxVus, startTime, maxDuration){
    const arr = new Array()
    do {
        let randomVus = randomIntBetween(1, maxVus)
        //let targetValue = tempVus<=r ? tempVus : r
        arr.push({
            executor: 'per-vu-iterations',
            vus: randomVus,
            iteration: 1, 
            startTime: startTime, 
            maxDuration: maxDuration
        })
        //tempVus -= r
        startTime += startTime+1
    }
    while(vus > 0)
        arr.push({
            executor: 'per-vu-iterations',
            vus: 0,
            iteration: 1, 
            startTime: startTime, 
            maxDuration: maxDuration
        })
    return arr;
}

/* export function setScenarios(scenarioNumber, vus, maxVus, startTime, maxDuration){
    const arr = new Array(scenarioNumber)
    for(let i = scenarioNumber-1; i >= 0; i--){
        if(i == scenarioNumber-1){
            arr[i] = {
                executor: 'per-vu-iterations',
                vus: vus,
                iteration: 1, 
                startTime: startTime+'s', 
                maxDuration: maxDuration
            }
        }else{
            let randomVus = randomIntBetween(1, maxVus)
            arr[i] = {
                executor: 'per-vu-iterations',
                vus: vus,
                iteration: 1, 
                startTime: startTime+'s', 
                maxDuration: maxDuration
            }
            startTime += startTime+1
        }
    }
} */