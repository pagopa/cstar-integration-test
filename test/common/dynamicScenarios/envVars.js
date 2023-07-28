import { coalesce } from '../utils.js'

const vu = parseInt(coalesce(__ENV.VUS_MAX_ENV, 3))

const rampStageNumber = Math.max(
    parseInt(coalesce(__ENV.SCENARIO_RAMP_STAGE_NUMBER_ENV, 3)),
    3
)

export const CONFIG = {
    TARGET_ENV: __ENV.TARGET_ENV,
    SCRIPT: __ENV.SCRIPT,
    DUMP_REQUESTS: __ENV.REQ_DUMP && __ENV.REQ_DUMP.toLowerCase() === 'true',

    VIRTUAL_USERS: vu,
    MAX_AVAILABLE_TEST_ENTITIES_ENV: coalesce(
        __ENV.MAX_AVAILABLE_TEST_ENTITIES_ENV,
        vu
    ),

    SCENARIOS: {
        TYPES: coalesce(__ENV.SCENARIO_TYPE_ENV, 'ALL').split(','),

        perVuIterations: {
            ONESHOT:
                __ENV.SCENARIO_PER_VU_SINGLE_ITERATION_ENV &&
                __ENV.SCENARIO_PER_VU_SINGLE_ITERATION_ENV.toLowerCase() !==
                    'false',
            EXECUTIONS: parseInt(
                coalesce(__ENV.SCENARIO_PER_VU_EXECUTIONS_ENV, 1)
            ),
            DURATION: parseInt(coalesce(__ENV.SCENARIO_DURATION_ENV, 3)),
        },

        constantArrivalRate: {
            RATE: vu,
            DURATION: parseInt(coalesce(__ENV.SCENARIO_DURATION_ENV, 3)),
            TIME_UNIT: parseInt(coalesce(__ENV.SCENARIO_TIME_UNIT_ENV, 1)),
        },

        RAMPS: {
            STAGES_NUMBER: rampStageNumber,
            STAGE_SECONDS_DURATION: parseInt(
                coalesce(__ENV.SCENARIO_TIME_UNIT_ENV, 1)
            ),

            rampingGrowingArrivalRate: {
                RAMP_BUILDING_VU_POOL: Math.min(
                    parseInt(
                        coalesce(
                            __ENV.SCENARIO_RAMP_GROWING_RAMP_BUILDING_VU_POOL,
                            Math.ceil((vu * (rampStageNumber - 1)) / 2)
                        )
                    ),
                    Math.ceil((vu * (rampStageNumber - 1)) / 2)
                ),
            },
        },
    },

    THRESHOLDS: {
        AVG: parseInt(coalesce(__ENV.THRESHOLDS_API_MAX_AVG_MS_ENV, 500)),
        P90: parseInt(coalesce(__ENV.THRESHOLDS_API_MAX_P90_MS_ENV, 800)),
        P95: parseInt(coalesce(__ENV.THRESHOLDS_API_MAX_P95_MS_ENV, 1000)),
    },

    SUMMARY: {
        RESULTS_DIR: __ENV.RESULTS_DIR,
    },
}

export const defaultHeaders = {
    'Content-Type': 'application/json',
}
