import { group } from 'k6'
import { login } from '../common/api/bpdIoLogin.js'
import {
	getCitizen,
	putCitizen,
	deleteCitizen,
} from '../common/api/bpdIoCitizenV2.js'
import {
	assert,
	statusOk,
	statusNoContent,
	bodyJsonSelectorValue,
} from '../common/assertions.js'
import { isEnvValid, isTestEnabledOnEnv, UAT } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'

const REGISTERED_ENVS = [UAT]

const services = JSON.parse(open('../../services/environments.json'))
let baseUrl
let myEnv

if (isEnvValid(__ENV.TARGET_ENV)) {
	myEnv = dotenv.parse(open(`../../.env.${__ENV.TARGET_ENV}.local`))
	baseUrl = services[`${__ENV.TARGET_ENV}_io`].baseUrl
}

export function setup() {
	const authToken = login(baseUrl, myEnv.FISCAL_CODE_EXISTING)
	return {
		headers: {
			Authorization: `Bearer ${authToken}`,
			'Ocp-Apim-Subscription-Key': `${myEnv.APIM_SK};product=app-io-product`,
			'Ocp-Apim-Trace': 'true',
		},
	}
}

export default (params) => {
    console.log(JSON.stringify(params))
	if (
		!isEnvValid(__ENV.TARGET_ENV) ||
		!isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)
	) {
		return
	}
	group('Citizen OptIn Status', () => {
		group('Should PUT Citizen without an opt in status', () =>
			assert(
				putCitizen(baseUrl, params, {}, myEnv.FISCAL_CODE_EXISTING),
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
			assert(getCitizen(baseUrl, params, myEnv.FISCAL_CODE_EXISTING), [
				statusOk(),
				bodyJsonSelectorValue('fiscalCode', myEnv.FISCAL_CODE_EXISTING),
				bodyJsonSelectorValue('enabled', true),
				bodyJsonSelectorValue('optInStatus', 'NOREQ'),
			])
		)
		group('Should PUT Citizen with ACCEPTED status', () =>
			assert(
				putCitizen(
					baseUrl,
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
					baseUrl,
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
			assert(deleteCitizen(baseUrl, params, myEnv.FISCAL_CODE_EXISTING), [
				statusNoContent(),
			])
		)
		group('Should PUT Citizen without an opt in status', () =>
			assert(
				putCitizen(baseUrl, params, {}, myEnv.FISCAL_CODE_EXISTING),
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
			assert(getCitizen(baseUrl, params, myEnv.FISCAL_CODE_EXISTING), [
				statusOk(),
				bodyJsonSelectorValue('fiscalCode', myEnv.FISCAL_CODE_EXISTING),
				bodyJsonSelectorValue('enabled', true),
				bodyJsonSelectorValue('optInStatus', 'NOREQ'),
			])
		)
		group('Should PUT Citizen with DENIED status', () =>
			assert(
				putCitizen(
					baseUrl,
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
					baseUrl,
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
			assert(deleteCitizen(baseUrl, params, myEnv.FISCAL_CODE_EXISTING), [
				statusNoContent(),
			])
		)
	})
}
