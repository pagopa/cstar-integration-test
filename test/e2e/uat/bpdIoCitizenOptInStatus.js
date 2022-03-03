import http from 'k6/http'
import { group } from 'k6'
import { login } from '../../common/api/bpdIoLogin.js'
import {
    GetCitizenWithOptInStatusNOREQ,
    PutCitizenWithOptInStatusACCEPTED,
    PutCitizenWithOptInStatusNOREQAfterACCEPTED,
    PutCitizenWithOptInStatusDENIED,
    PutCitizenWithOptInStatusNOREQAfterDENIED,
    PutCitizenWithoutOptInStatus,
    DeleteCitizen,
} from '../../common/api/bpdIoCitizenV2.js'
import {
    assert,
    statusOk,
    bodyJsonSelectorValue,
} from '../../common/assertions.js'
import dotenv from 'k6/x/dotenv'

export let services = JSON.parse(open('../../../services/environments.json'))

// open is only available in global scope
const myEnv = dotenv.parse(open('.env.test.local'))

export function setup() {
    return login(services.uat_io.baseUrl, myEnv.FISCAL_CODE_EXISTING)
}

export default (authToken) => {
    group('Citizen OptIn Status', () => {
        let params = {
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Ocp-Apim-Subscription-Key': `${myEnv.APIM_SK};product=app-io-product`,
                'Ocp-Apim-Trace': 'true',
            },
        }

        group('Should PUT Citizen without an opt in status', () =>
            assert(
                PutCitizenWithoutOptInStatus(
                    services.uat_io.baseUrl,
                    params,
                    myEnv.FISCAL_CODE_EXISTING
                ),
                [
                    statusOk(),
                    bodyJsonSelectorValue(
                        'fiscalCode',
                        myEnv.FISCAL_CODE_EXISTING
                    ),
                    bodyJsonSelectorValue('enabled', true),
                    bodyJsonSelectorValue('optInStatus', 'NOREQ'),
                ]
            )
        )
        // group('Should GET Citizen with NOREQ status', () => GetCitizenWithOptInStatusNOREQ(
        //   services.uat_io.baseUrl, params, myEnv.FISCAL_CODE_EXISTING));
        // group('Should PUT Citizen with ACCEPTED status', () => PutCitizenWithOptInStatusACCEPTED(
        //   services.uat_io.baseUrl, params, myEnv.FISCAL_CODE_EXISTING));
        // group('Should NOT PUT Citizen with NOREQ after ACCEPTED', () => PutCitizenWithOptInStatusNOREQAfterACCEPTED(
        //   services.uat_io.baseUrl, params, myEnv.FISCAL_CODE_EXISTING));
        // group('Should DELETE a Citizen and restore NOREQ status', () => DeleteCitizen(
        //   services.uat_io.baseUrl, params, myEnv.FISCAL_CODE_EXISTING));
        // group('Should PUT Citizen without an opt in status', () => PutCitizenWithoutOptInStatus(
        //   services.uat_io.baseUrl, params, myEnv.FISCAL_CODE_EXISTING));
        // group('Should GET Citizen with NOREQ status', () => GetCitizenWithOptInStatusNOREQ(
        //   services.uat_io.baseUrl, params, myEnv.FISCAL_CODE_EXISTING));
        // group('Should PUT Citizen with DENIED status', () => PutCitizenWithOptInStatusDENIED(
        //   services.uat_io.baseUrl, params, myEnv.FISCAL_CODE_EXISTING));
        // group('Should NOT PUT Citizen with NOREQ after DENIED', () => PutCitizenWithOptInStatusNOREQAfterDENIED(
        //   services.uat_io.baseUrl, params, myEnv.FISCAL_CODE_EXISTING));
        // group('Should DELETE a Citizen and restore NOREQ status', () => DeleteCitizen(
        //   services.uat_io.baseUrl, params, myEnv.FISCAL_CODE_EXISTING));
    })
}
