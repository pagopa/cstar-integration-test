import {isEnvValid} from "./envs.js";
import dotenv from 'k6/x/dotenv'

export function setupEnvironment(environmentsPath) {
    const services = JSON.parse(open(environmentsPath))
    if (isEnvValid(__ENV.TARGET_ENV)) {
        const myEnv = dotenv.parse(open(`../../.env.${__ENV.TARGET_ENV}.local`))
        const baseUrl = services[`${__ENV.TARGET_ENV}_issuer`].baseUrl
        const environmentServices = Object.keys(services).filter(key => key.startsWith(__ENV.TARGET_ENV))
            .reduce((current, key) => Object.assign(current, { [key.split(`${__ENV.TARGET_ENV}_`)[1]]: services[key]}), {});

        return {
            env: myEnv,
            baseUrl: baseUrl,
            services: environmentServices
        }
    } else {
        throw new Error("Invalid environment");
    }
}