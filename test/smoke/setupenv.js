import {isEnvValid} from "../common/envs.js";
import dotenv from 'k6/x/dotenv'

export function setupEnvironment(environmentsPath) {
    const services = JSON.parse(open(environmentsPath))
    if (isEnvValid(__ENV.TARGET_ENV)) {
        const myEnv = dotenv.parse(open(`../../.env.${__ENV.TARGET_ENV}.local`))
        const baseUrl = services[`${__ENV.TARGET_ENV}_issuer`].baseUrl

        return {
            env: myEnv,
            baseUrl: baseUrl
        }
    } else {
        throw new Error("Invalid environment");
    }
}