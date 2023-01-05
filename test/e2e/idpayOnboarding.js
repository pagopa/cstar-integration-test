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
let fiscalCodeRandom = randomFiscalCode()

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

function initiative() {
    const params = "01GNYFQQNXEMQJ23DPXMMJ4M5N"
    const res = getInitiative(
        baseUrl,
        auth(fiscalCodeRandom),
        params
    )
    const bodyObj = JSON.parse(res.body)
    return bodyObj.initiativeId
}

export default () => {

    if (
        !isEnvValid(DEV) ||
        !isTestEnabledOnEnv(DEV, REGISTERED_ENVS)
    ) {

        return
    }

    group('Should onboard Citizen', () => {
        group('When the inititive exists', () => {
            const body = {
                initiativeId: initiative()
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
            const params = initiative()
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
                initiativeId: initiative()
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
                initiativeId: initiative(),
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
