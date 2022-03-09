import { group, sleep } from 'k6'
import { putBlob } from '../common/api/rtdStorage.js'
import { assert, statusCreated } from '../common/assertions.js'
import { isEnvValid, isTestEnabledOnEnv, DEV, UAT } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'
import exec from 'k6/execution';

const REGISTERED_ENVS = [DEV, UAT]

const services = JSON.parse(open('../../services/environments.json'))
const BLOB_PREFIX = 'CSTAR.K6000.TRNLOG.'
const BLOB_SUFFIX = '.NNN.csv.pgp'
export let options = {
	vus: 9,
	duration: '1m',
  }
let params = {}
let baseUrl
let myEnv
let payload
let n = 1

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
		'Ocp-Apim-Subscription-Key': myEnv.APIM_RTDPRODUCT_SK,
		'Ocp-Apim-Trace': 'true',
	}

	payload = open(`../../assets/trx-list-input.csv.pgp`, 'b')
}

export default () => {
	if (
		!isEnvValid(__ENV.TARGET_ENV) ||
		!isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS) ||
		!myEnv.RTD_STORAGE_CONTAINER
	) {
		return
	}

	const blobDateTimePart = new Date()
		.toISOString()
		.replace('T', '.')
		.replace('-', '')
		.replace('-', '')
		.replace(':', '')
		.replace(':', '')
		.substring(0, 15)
	let blob = BLOB_PREFIX + blobDateTimePart + BLOB_SUFFIX
	blob = blob.replace('NNN', exec.vu.idInTest + String(n).padStart(2, '0'))

	group('Storage API', () => {
		group('Should upload file via PUT', () =>
			assert(
				putBlob(
					baseUrl,
					params,
					myEnv.RTD_STORAGE_CONTAINER,
					blob,
					payload,
					myEnv.RTD_STORAGE_SAS
				),
				[statusCreated()]
			)
		)
	})

	n += 1
	if (n > 99) {
		n = 1
	}
	sleep(1)
}
