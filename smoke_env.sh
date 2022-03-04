#!/bin/sh
#
# Quickly perform a smoke test on target environment by running each
# test found under test/smoke/<ENV> once.

TESTS_DIR="test/smoke"
K6_BINARY="k6"
K6_TEST_FILEEXT=".js"

set -e

ENV=$1

if [ -z "$ENV" ]; then
  echo "ENV should be: dev, uat or prod."
  exit 0
fi

for TEST in $(ls $TESTS_DIR/$ENV/*$K6_TEST_FILEEXT); do
	./$K6_BINARY run $TEST
done;
