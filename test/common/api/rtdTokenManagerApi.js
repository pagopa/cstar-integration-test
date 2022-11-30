import http from 'k6/http'

const API_PREFIX = "/rtd/token";
const PUBLIC_KEY_PATH = "/token-list/public-key";

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

    createUrl(path) {
        return `${this.baseUrl}${API_PREFIX}${path}`;
    }

}