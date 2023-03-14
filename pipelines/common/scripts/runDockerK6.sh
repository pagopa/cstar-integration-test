ls -lrt $(pwd)
docker run -i \
    --user $UID \
    -v $(pwd):/app \
    --workdir "/app" \
    -e TARGET_ENV=$(targetEnv) \
    -e SCENARIO_TYPE_ENV=$(scenarioType) \
    -e VIRTUAL_USERS_ENV=$(virtualUsers) \
    -e STAGE_NUMBER_ENV=$(stageNumber) \
    -e DURATION_PER_VU_ITERATION=$(durationPerVuIteration) \
    -e APIM_SK=$(targetApimSk) \
    -e SERVICE_ID=$(serviceId) \
    -e INITIATIVE_ID=$(initiativeId) \
    -e TRX_FILE_NAME=$(trxFileName) \
    grafana/k6:latest \
    run /app/test/performance/$(targetScript).js