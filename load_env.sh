#!/bin/bash
#
# Quickly perform a smoke test on target environment by running each
# test found under test/smoke once.
#
# Usage: ./smoke_env.sh <dev|uat|prod>


TESTS_DIR="test/performance"
K6_BINARY="k6"
K6_TEST_FILEEXT=".js"

set -e

ENV=$1

if [[ -z "$ENV" || ! "$ENV" =~ ^(dev|uat|prod)$ ]]; then
  echo "Usage: ./smoke_env.sh <dev|uat|prod>"
  exit 0
fi

for TEST in $(ls $TESTS_DIR/*$K6_TEST_FILEEXT); do
	TARGET_ENV=$ENV ./$K6_BINARY run $TEST
done;