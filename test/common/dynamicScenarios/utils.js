import exec from 'k6/execution'
import { scenario } from 'k6/execution'
import { coalesce } from '../utils.js'
import { CONFIG } from './envVars.js'

export const testEntitiesBasedScenarioPrefix = 'scenario_'
export function testEntitiesBasedScenariosParser(options) {
    let counter = 0
    const scenarioBaseIndexes = {}

    Object.keys(options.scenarios)
        .filter((scenarioName) =>
            scenarioName.startsWith(testEntitiesBasedScenarioPrefix)
        )
        .sort()
        .forEach((scenarioName) => {
            const singleScenario = options.scenarios[scenarioName]
            let scenarioBaseIndex = counter
            counter += singleScenario.vus
            scenarioBaseIndexes[scenarioName] = scenarioBaseIndex
        })
    return scenarioBaseIndexes
}
export function testEntitiesBasedScenariosBaseIndexRetriever() {
    const scenariosBaseIndexes = testEntitiesBasedScenariosParser(
        exec.test.options
    )
    return coalesce(scenariosBaseIndexes[scenario.name], 0)
}
export function getScenarioTestEntity(testEntities) {
    const baseIndex = testEntitiesBasedScenariosBaseIndexRetriever()
    return testEntities[baseIndex + scenario.iterationInTest]
}

export function logResult(opName, result, expectedHttpState) {
    if (CONFIG.DUMP_REQUESTS) {
        console.log(opName, JSON.stringify(result, null, 2))
    }
    if (expectedHttpState && result.status != expectedHttpState) {
        const resultStr = JSON.stringify(result, (key, value) =>
            key === 'Authorization'
                ? 'AUTHORIZATION_TOKEN from ENV'
                : key === 'Ocp-Apim-Subscription-Key'
                ? 'Ocp-Apim-Subscription-Key from ENV'
                : value
        )
        console.error(`${opName} -> ${result.status} - ${resultStr}`)
    }
}
