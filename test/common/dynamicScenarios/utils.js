import exec from 'k6/execution'
import { scenario } from 'k6/execution'
import { coalesce } from '../utils.js'

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
