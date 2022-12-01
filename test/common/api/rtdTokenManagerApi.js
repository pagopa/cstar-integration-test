import http from 'k6/http'

const API_PREFIX = "/rtd/token";
const PUBLIC_KEY_PATH = "/token-list/public-key";
const UPLOAD_TOKEN_FILE_PATH = "/token-list";
const KNOWN_HASHES_PATH = "/known-hashes/links";

export default class RtdTokenManagerApi {

    constructor(baseUrl, subscriptionKey) {
        this.baseUrl = baseUrl;
        this.headers = {
            'Ocp-Apim-Subscription-Key': subscriptionKey,
            'Ocp-Apim-Trace': 'true'
        }
    }

    getPublicKey() {
        return http.get(this.createUrl(PUBLIC_KEY_PATH), {
            headers: this.headers
        });
    }

    uploadTokenFile(binaryFile, fileName) {
        const multipart = {
            file: http.file(binaryFile, fileName)
        };
        return http.post(this.createUrl(UPLOAD_TOKEN_FILE_PATH), multipart, {
            headers: this.headers
        });
    }

    getKnownHashes() {
        return http.get(this.createUrl(KNOWN_HASHES_PATH), {
            headers: this.headers
        })
    }

    createUrl(path) {
        return `${this.baseUrl}${API_PREFIX}${path}`;
    }

}