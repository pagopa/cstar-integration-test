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
    return testEntities[
        (baseIndex + scenario.iterationInTest) % testEntities.length
    ]
}

export function logResult(opName, result, expectedHttpState) {
    if (CONFIG.DUMP_REQUESTS) {
        console.log(opName, JSON.stringify(result, null, 2))
    }
    if (expectedHttpState && result.status != expectedHttpState) {
        logErrorResult(opName, result, false)
    }
}

const secretHeaders = ['Authorization', 'Ocp-Apim-Subscription-Key']
export const jsonStringifySecretRemoverFunction = (key, value) =>
    secretHeaders.indexOf(key) > -1 ? `${key.toUpperCase()}_VALUE` : value

export function logErrorResult(opName, result, printSecrets) {
    const resultStr = JSON.stringify(
        result,
        printSecrets ? undefined : jsonStringifySecretRemoverFunction
    )
    console.error(`${opName} -> ${result.status} - ${resultStr}`)
}
