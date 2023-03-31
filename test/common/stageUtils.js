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
export function setScenarios(vus, maxVus, startTime, maxDuration){
    let scenarios = {}
    let counter = 0
    do {
        let randomVus = randomIntBetween(1, maxVus)
        let actualVus = vus <= randomVus ? vus : randomVus
        const propertyName = `scenario_${counter}`
        scenarios[propertyName]= {
            executor: 'per-vu-iterations',
            vus: actualVus,
            iterations: 1,
            startTime: `${startTime}s`,
            maxDuration: `${maxDuration}s`
        }
        startTime=parseInt(startTime)+parseInt(maxDuration)
        counter++
        vus -= randomVus
    }
    while(vus > 0)
    return scenarios
}

//export function setStages(tempVus, durationStages, maxTarget, stageNumber) {
//    const arr = new Array(stageNumber);
//    let remainingStages = stageNumber;
//
//    while (remainingStages > 1 && tempVus > 0) {
//        let r = randomIntBetween(1, maxTarget)
//        let targetValue = tempVus<=r ? tempVus : r
//        arr[stageNumber - remainingStages] = {duration: durationStages, target: targetValue}
//        tempVus -= r
//        remainingStages--;
//    }
//
//    arr[stageNumber - 1] = {duration: durationStages, target: 0}
//
//    return arr;
//}


