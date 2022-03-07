import { group } from 'k6'
import exec from 'k6/execution'
import { createRtdSas } from '../common/api/rtdCsvTransaction.js'
import { assert, statusCreated } from '../common/assertions.js'
import { isEnvValid, isTestEnabledOnEnv, DEV, UAT } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'

const REGISTERED_ENVS = [DEV, UAT]

const services = JSON.parse(open('../../services/environments.json'))
export let options = JSON.parse(open('../../options/baseline_load.json'))
let params = {}
let baseUrl
let myEnv

if (isEnvValid(__ENV.TARGET_ENV)) {
	myEnv = dotenv.parse(open(`../../.env.${__ENV.TARGET_ENV}.local`))
	baseUrl = services[`${__ENV.TARGET_ENV}_issuer`].baseUrl

	options.tlsAuth = [
		{
			domains: [baseUrl],
			cert: open(`../../certs/${myEnv.MAUTH_CERT_NAME}`),
			key: open(`../../certs/${myEnv.MAUTH_PRIVATE_KEY_NAME}`),
		},
	]

	params.headers = {
		'Ocp-Apim-Subscription-Key': myEnv.APIM_SK,
		'Ocp-Apim-Trace': 'true',
	}
}

// In performance tests we shall use abort() to prevent the execution
// of the default function, otherwise the VUs will be spawned
if (!isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)) {
	console.log('Test not enabled for target env')
	exec.test.abort()
}

export default () => {
	group('CSV Transaction API', () => {
		group('Should create RTD SAS', () =>
			assert(createRtdSas(services.dev_issuer.baseUrl, params), [
				statusCreated(),
			])
		)
	})
}
