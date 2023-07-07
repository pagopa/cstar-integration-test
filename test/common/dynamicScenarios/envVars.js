import { coalesce } from '../utils.js'

const vu = coalesce(__ENV.VUS_MAX_ENV, 3)

const rampStageNumber = Math.max(
    coalesce(__ENV.SCENARIO_RAMP_STAGE_NUMBER_ENV, 3),
    3
)

export const CONFIG = {
    TARGET_ENV: __ENV.TARGET_ENV,
    DUMP_REQUESTS: __ENV.REQ_DUMP,

    VIRTUAL_USERS: vu,
    MAX_AVAILABLE_TEST_ENTITIES_ENV: coalesce(
        __ENV.MAX_AVAILABLE_TEST_ENTITIES_ENV,
        vu
    ),

    SCENARIOS: {
        TYPES: coalesce(__ENV.SCENARIO_TYPES_ENV, 'ALL').split(','),

        perVuIterations: {
            ONESHOT: !(__ENV.SCENARIO_PER_VU_SINGLE_ITERATION_ENV === 'false'),
            EXECUTIONS: coalesce(__ENV.SCENARIO_PER_VU_EXECUTIONS_ENV, 1),
            DURATION: coalesce(__ENV.SCENARIO_PER_VU_DURATION_ENV, 1),
        },

        constantArrivalRate: {
            RATE: coalesce(__ENV.SCENARIO_CONSTANT_RATE_ENV, 10),
            DURATION: coalesce(__ENV.SCENARIO_PER_VU_DURATION_ENV, 1),
            TIME_UNIT: coalesce(__ENV.SCENARIO_TIME_UNIT_ENV, 1),
        },

        RAMPS: {
            STAGES_NUMBER: rampStageNumber,
            STAGE_SECONDS_DURATION: coalesce(__ENV.SCENARIO_TIME_UNIT_ENV, 1),

            rampingGrowingArrivalRate: {
                RAMP_BUILDING_VU_POOL: Math.min(
                    coalesce(
                        __ENV.SCENARIO_RAMP_GROWING_RAMP_BUILDING_VU_POOL,
                        Math.ceil((vu * (rampStageNumber - 1)) / 2)
                    ),
                    Math.ceil((vu * (rampStageNumber - 1)) / 2)
                ),
            },
        },
    },

    THRESHOLDS: {
        AVG: coalesce(__ENV.THRESHOLDS_API_MAX_AVG_MS_ENV, 500),
        P90: coalesce(__ENV.THRESHOLDS_API_MAX_P90_MS_ENV, 800),
        P95: coalesce(__ENV.THRESHOLDS_API_MAX_P95_MS_ENV, 1000),
    },

    SUMMARY: {
        RESULTS_DIR: __ENV.RESULTS_DIR,
    },
}

export const defaultHeaders = {
    'Content-Type': 'application/json',
}
