import { group } from 'k6'
import { login } from '../common/api/bpdIoLogin.js'
import { getBpdIoPaymentInstrumentV1 } from '../common/api/bpdIoPaymentInstruments.js'
import {
	assert,
	statusOk,
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
	if (
		!isEnvValid(__ENV.TARGET_ENV) ||
		!isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)
	) {
		return
	}
	group('Payment Instrument API', () => {
		group('Should get payment instrument', () =>
			assert(
				getBpdIoPaymentInstrumentV1(
					baseUrl,
					params,
					myEnv.PAYMENT_INSTRUMENT_EXISTING
				),
				[
					statusOk(),
					bodyJsonSelectorValue(
						'hpan',
						myEnv.PAYMENT_INSTRUMENT_EXISTING
					),
				]
			)
		)
	})
}
