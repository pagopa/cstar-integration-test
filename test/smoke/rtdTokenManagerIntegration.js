import { group } from 'k6'
import { assert, statusOk } from '../common/assertions.js'
import RtdTokenManagerApi from "../common/api/rtdTokenManagerApi.js";
import {setupEnvironment} from "./setupenv.js";

const {env, baseUrl} = setupEnvironment('../../services/environments.json');
export const options = {
    tlsAuth: [
        {
            domains: [baseUrl],
            cert: open(`../../certs/${env.MAUTH_CERT_NAME}`),
            key: open(`../../certs/${env.MAUTH_PRIVATE_KEY_NAME}`),
        },
    ]
}

export default () => {
    group('RTD Token Manager Integration API', () => {
        const api = new RtdTokenManagerApi(baseUrl, env.APIM_RTDPRODUCT_SK);
        group('Should get public key', () =>
            assert(api.getPublicKey(), [
                statusOk()
            ])
        )
    })
}
