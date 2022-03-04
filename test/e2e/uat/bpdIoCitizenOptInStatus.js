import { group } from 'k6'
import { login } from '../../common/api/bpdIoLogin.js'
import {
    getCitizen,
	putCitizen,
    deleteCitizen,
} from '../../common/api/bpdIoCitizenV2.js'
import {
    assert,
    statusOk,
    statusNoContent,
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
                putCitizen(
                    services.uat_io.baseUrl,
                    params,
					{},
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
        group('Should GET Citizen with NOREQ status', () =>
            assert(
                getCitizen(
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
        group('Should PUT Citizen with ACCEPTED status', () =>
            assert(
                putCitizen(
                    services.uat_io.baseUrl,
                    params,
					{ optInStatus: 'ACCEPTED' },
                    myEnv.FISCAL_CODE_EXISTING
                ),
                [
                    statusOk(),
                    bodyJsonSelectorValue(
                        'fiscalCode',
                        myEnv.FISCAL_CODE_EXISTING
                    ),
                    bodyJsonSelectorValue('enabled', true),
                    bodyJsonSelectorValue('optInStatus', 'ACCEPTED'),
                ]
            )
        )
        group('Should NOT PUT Citizen with NOREQ after ACCEPTED', () =>
            assert(
                putCitizen(
                    services.uat_io.baseUrl,
                    params,
					{ optInStatus: 'NOREQ' },
                    myEnv.FISCAL_CODE_EXISTING
                ),
                [
                    statusOk(),
                    bodyJsonSelectorValue(
                        'fiscalCode',
                        myEnv.FISCAL_CODE_EXISTING
                    ),
                    bodyJsonSelectorValue('enabled', true),
                    bodyJsonSelectorValue('optInStatus', 'ACCEPTED'),
                ]
            )
        )
        group('Should DELETE a Citizen and restore NOREQ status', () =>
            assert(
                deleteCitizen(
                    services.uat_io.baseUrl,
                    params,
                    myEnv.FISCAL_CODE_EXISTING
                ),
                [statusNoContent()]
            )
        )
        group('Should PUT Citizen without an opt in status', () =>
            assert(
                putCitizen(
                    services.uat_io.baseUrl,
                    params,
					{},
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
        group('Should GET Citizen with NOREQ status', () =>
            assert(
                getCitizen(
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
        group('Should PUT Citizen with DENIED status', () =>
            assert(
                putCitizen(
                    services.uat_io.baseUrl,
                    params,
					{ optInStatus: 'DENIED' },
                    myEnv.FISCAL_CODE_EXISTING
                ),
                [
                    statusOk(),
                    bodyJsonSelectorValue(
                        'fiscalCode',
                        myEnv.FISCAL_CODE_EXISTING
                    ),
                    bodyJsonSelectorValue('enabled', true),
                    bodyJsonSelectorValue('optInStatus', 'DENIED'),
                ]
            )
        )
        group('Should NOT PUT Citizen with NOREQ after DENIED', () =>
            assert(
                putCitizen(
                    services.uat_io.baseUrl,
                    params,
					{ optInStatus: 'NOREQ' },
                    myEnv.FISCAL_CODE_EXISTING
                ),
                [
                    statusOk(),
                    bodyJsonSelectorValue(
                        'fiscalCode',
                        myEnv.FISCAL_CODE_EXISTING
                    ),
                    bodyJsonSelectorValue('enabled', true),
                    bodyJsonSelectorValue('optInStatus', 'DENIED'),
                ]
            )
        )
        group('Should DELETE a Citizen and restore NOREQ status', () =>
            assert(
                deleteCitizen(
                    services.uat_io.baseUrl,
                    params,
                    myEnv.FISCAL_CODE_EXISTING
                ),
                [statusNoContent()]
            )
        )
    })
}
