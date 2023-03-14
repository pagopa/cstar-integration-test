ls -lrt $(pwd)
docker run -i \
    --name ksixtests \
    --user $UID \
    -v $(pwd):/app \
    --workdir "/app" \
    -e TARGET_ENV=${{ parameters.TARGET_ENV }} \
    -e SCENARIO_TYPE_ENV=${{ parameters.SCENARIO_TYPE_ENV }} \
    -e VIRTUAL_USERS_ENV=${{ parameters.VIRTUAL_USERS_ENV }} \
    -e STAGE_NUMBER_ENV=${{ parameters.STAGE_NUMBER_ENV }} \
    -e DURATION_PER_VU_ITERATION=${{ parameters.DURATION_PER_VU_ITERATION }} \
    -e APIM_SK=${{ parameters.APIM_SK }} \
    -e SERVICE_ID=${{ parameters.SERVICE_ID }} \
    -e INITIATIVE_ID=${{ parameters.INITIATIVE_ID }} \
    -e TRX_FILE_NAME=$(trxFileName) \
    grafana/k6:latest \
    run /app/test/performance/${{ parameters.SCRIPT }}.js