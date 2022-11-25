import { group } from 'k6'
import {
     putOnboardingCitizen,
     putCheckPrerequisites,
     getInitiative,
     getStatus,
     putSaveConsent
    } from '../common/api/idpayOnboardingCitizen.js'
import { loginFullUrl } from '../common/api/bpdIoLogin.js'
import { assert, statusNoContent, statusAccepted, statusOk, bodyJsonSelectorValue } from '../common/assertions.js'
import { isEnvValid, isTestEnabledOnEnv, DEV } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'
import { randomFiscalCode } from '../common/utils.js'

const REGISTERED_ENVS = [DEV]

const services = JSON.parse(open('../../services/environments.json'))
let baseUrl
let myEnv
const fiscalCodeRandom = randomFiscalCode()

if (isEnvValid(DEV)) {
    myEnv = dotenv.parse(open(`../../env.dev.local`))
    baseUrl = services[`dev_io`].baseUrl
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
            'Ocp-Apim-Subscription-Key': `${myEnv.APIM_SK}`,
            'Ocp-Apim-Trace': 'true'
        },
    }
}

export default () => {

    if (
        !isEnvValid(DEV) ||
        !isTestEnabledOnEnv(DEV, REGISTERED_ENVS)
    ) {

        return
    }

    group('Should inititive be', () => {
        group('When the service exists', () => {
            const params = "01GJPZACZ4E5P69S4RY1E0EMMD"
            
            assert(
                getInitiative(
                    baseUrl,
                    auth(fiscalCodeRandom),
                    params
                ),
                [statusOk(),
                bodyJsonSelectorValue('initiativeId', '63807d3c4d9d7e68e35e79b3'),
                bodyJsonSelectorValue('description', 'italiano')]
            )
        })
    })


    group('Should onboard Citizen', () => {
        group('When the inititive exists', () => {
            const body = {
                initiativeId: '63807d3c4d9d7e68e35e79b3'
            }
            assert(
                putOnboardingCitizen(
                    baseUrl,
                    JSON.stringify(body),
                    auth(fiscalCodeRandom)
                ),
                [statusNoContent()]
            )
        })
    })

    group('Should onboard status be', () => {
        group('When inititive exists', () => {
            const params = '63807d3c4d9d7e68e35e79b3'
            assert(
                getStatus(
                    baseUrl,
                    auth(fiscalCodeRandom),
                    params
                ),
                [statusOk(),
                bodyJsonSelectorValue('status', 'ACCEPTED_TC')]
            )
        })
    })

    group('Should Citizen pre-requisites', () => {
        group('When the TC consent exists', () => {
            const body = {
                initiativeId: '63807d3c4d9d7e68e35e79b3'
            }
            assert(
                putCheckPrerequisites(
                    baseUrl,
                    JSON.stringify(body),
                    auth(fiscalCodeRandom)
                ),
                [statusOk()]
            )
        })
    })


    group('Save consent should be ok', () => {
        group('When the inititive and consents exist', () => {
            const body = {
                initiativeId: '63807d3c4d9d7e68e35e79b3',
                pdndAccept: true,
                selfDeclarationList: []
            }
            assert(
                putSaveConsent(
                    baseUrl,
                    JSON.stringify(body),
                    auth(fiscalCodeRandom)
                ),
                [statusAccepted()]
            )
        })
    })
}
