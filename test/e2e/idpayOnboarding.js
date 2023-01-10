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
import { isEnvValid, isTestEnabledOnEnv, UAT } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'
import { randomFiscalCode } from '../common/utils.js'

const REGISTERED_ENVS = [UAT]

const services = JSON.parse(open('../../services/environments.json'))
let baseUrl
let myEnv
let fiscalCodeRandom = randomFiscalCode()
let init

if (isEnvValid(UAT)) {
    myEnv = dotenv.parse(open(`../../env.dev.local`))
    baseUrl = services[`uat_io`].baseUrl
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
    let checked = true

    if (
        !isEnvValid(UAT) ||
        !isTestEnabledOnEnv(UAT, REGISTERED_ENVS)
    ) {

        return
    }

    const params = "01GNYFQQNXEMQJ23DPXMMJ4M5N"
    if (checked){
        const res = getInitiative(
            baseUrl,
            auth(fiscalCodeRandom),
            params
        )
        if(res.status != 200){
            console.error('ERROR-> '+JSON.stringify(res))
            checked = false
            console.log("Bloccati getInitiative: ")
            return
        }
    
        const bodyObj = JSON.parse(res.body)
        init = bodyObj.initiativeId
    }
            

    group('Should onboard Citizen', () => {
        group('When the inititive exists', () => {
            if(checked){
            
            const body = {
                initiativeId: init
            }
            
                let res = putOnboardingCitizen(
                    baseUrl,
                    JSON.stringify(body),
                    auth(fiscalCodeRandom)
                )

                if(res.status != 204){
                    console.log('ERROR-> '+JSON.stringify(res))
                    checked = false
                    console.log("Bloccati putOnboardingCitizen: ")
                }
                
                assert(res,
                [statusNoContent()])
            }

            return
            
        })
    })

    group('Should onboard status be', () => {
        group('When inititive exists', () => {
            if(checked){
            const params = init
            let res = getStatus(
                    baseUrl,
                    auth(fiscalCodeRandom),
                    params
                )

            if(res.status != 200){
                console.log('ERROR-> '+JSON.stringify(res))
                checked = false
                console.log("Bloccati getStatus: ")
            }
            
            assert(res,
            [statusOk(),
            bodyJsonSelectorValue('status', 'ACCEPTED_TC')])
        }
        return
        })
    })

    group('Should Citizen pre-requisites', () => {
        group('When the TC consent exists', () => {
            if(checked){
            const body = {
                initiativeId: init
            }
                let res = putCheckPrerequisites(
                    baseUrl,
                    JSON.stringify(body),
                    auth(fiscalCodeRandom)
                )
            if(res.status != 200){
                console.log('ERROR-> '+JSON.stringify(res))
                checked = false
                console.log("Bloccati putCheckPrerequisites: ")
            }
            
            assert(res,
            [statusOk()])
            }
            return
        })
    })


    group('Save consent should be ok', () => {
        group('When the inititive and consents exist', () => {
            if(checked){
            const body = {
                initiativeId: init,
                pdndAccept: true,
                selfDeclarationList: []
            }
                let res = putSaveConsent(
                    baseUrl,
                    JSON.stringify(body),
                    auth(fiscalCodeRandom)
                )
            if(res.status != 202){
                console.log('ERROR-> '+JSON.stringify(res))
                checked = false
                console.log("Bloccati putSaveConsent: ")
            }
            
            assert(res,
            [statusAccepted()])
            }
        })
    })
}
