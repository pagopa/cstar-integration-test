import { group } from 'k6'
import {
     putOnboardingCitizen,
     putCheckPrerequisites,
     getInitiative,
     getStatus,
     putSaveConsent
    } from '../common/api/idpayOnbardingCitizen.js'
import { loginFullUrl } from '../common/api/bpdIoLogin.js'
import { assert, statusNoContent, statusAccepted, statusOk } from '../common/assertions.js'
import { isEnvValid, isTestEnabledOnEnv, PROD } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'
import { randomFiscalCode } from '../common/utils.js'

const REGISTERED_ENVS = [PROD]

const services = JSON.parse(open('../../services/environments.json'))
let baseUrl
let myEnv

if (isEnvValid(__ENV.TARGET_ENV)) {
    myEnv = dotenv.parse(open(`../../.env.${__ENV.TARGET_ENV}.local`))
    baseUrl = services[`${__ENV.TARGET_ENV}_io`].baseUrl
}

function auth(fiscalCode) {
    const authToken = loginFullUrl(
        `${baseUrl}/bpd/pagopa/api/v1/login`,
        fiscalCode
    )
    return {
        headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': `${myEnv.APIM_SK};product=app-io-product`,
            'Ocp-Apim-Trace': 'true',
            'Accept-Language': 'it_IT',
        },
    }
}

export default () => {

    if (
        !isEnvValid(__ENV.TARGET_ENV) ||
        !isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)
    ) {
        return
    }
    group('Should onboard Citizen', () => {
        group('When the inititive exists', () => {
            const body = {
                initiativeId: '123',
            }
            assert(
                putOnboardingCitizen(
                    baseUrl,
                    JSON.stringify(body),
                    auth(randomFiscalCode())
                ),
                [statusNoContent()]
            )
        })
    })

    group('Should Citizen pre-requisites', () => {
        group('When the inititive exists', () => {
            const body = {
                initiativeId: '123',
            }
            assert(
                putCheckPrerequisites(
                    baseUrl,
                    JSON.stringify(body),
                    auth(randomFiscalCode())
                ),
                [statusOk()]
            )
        })
    })

    group('Should inititive', () => {
        group('When the service exists', () => {
            const params = {
                serviceId: '12345',
            }
            assert(
                getInitiative(
                    baseUrl,
                    auth(randomFiscalCode()),
                    JSON.stringify(params)
                ),
                [statusOk(),
                bodyJsonSelectorValue('initiativeId', '123'),
                bodyJsonSelectorValue('description', 'string')]
            )
        })
    })

    group('Should onboard status be', () => {
        group('When the inititive exists', () => {
            const params = {
                initiativeId: '123',
            }
            assert(
                getStatus(
                    baseUrl,
                    auth(randomFiscalCode()),
                    JSON.stringify(params)
                ),
                [statusOk(),
                bodyJsonSelectorValue('status', 'ACCEPTED_TC')]
            )
        })
    })

    group('Save consent should be ok', () => {
        group('When the inititive and consents exist', () => {
            const body = {
                initiativeId: '123',
                pdndAccept: true,
                selfDeclarationList: [
                    {
                      _type: "boolean",
                      code: "string",
                      accepted: true
                    }
                  ]
            }
            assert(
                putSaveConsent(
                    baseUrl,
                    JSON.stringify(body),
                    auth(randomFiscalCode())
                ),
                [statusAccepted()]
            )
        })
    })
}
