import { group, check } from 'k6'
import {assert, bodyJsonReduceArray, bodyPgpPublicKey, statusOk} from '../common/assertions.js'
import RtdTokenManagerApi from "../common/api/rtdTokenManagerApi.js";
import {setupEnvironment} from "../common/setupenv.js";

const {env, baseUrl} = setupEnvironment('../../services/environments.json');
const stubTokenFile = open("stub-files/tokenFile.csv");
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
                statusOk(),
                bodyPgpPublicKey()
            ])
        )

        group('Should upload a token file', () =>
            assert(api.uploadTokenFile(stubTokenFile, 'tokenFile.csv'), [
                statusOk(),
                (res) => check(res, {
                    "response include filename": res.json()["filename"].includes('tokenFile')
                })
            ])
        )

        group("Should get known hashes", () =>
            assert(api.getKnownHashes(), [
                statusOk()
            ])
        )

        group("Should get bin ranges", () =>
            assert(api.getBinRanges(), [
                statusOk()
            ])
        )
    })
}
