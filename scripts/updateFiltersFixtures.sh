#!/bin/sh

current_dir=$(pwd)

while [ ! -e 'package.json' ]; do
  if [ -e '.git' ]; then
    echo "Failed to find package.json. Please re-run this script from the root of the package."
    exit 1
  fi
  cd ..
done

PACKAGE_VERSION=$(node -e "console.log(require('./package.json').version)")

if [ ! -n ${PACKAGE_VERSION} ]; then
  echo "Failed to get package version from package.json. Please re-run this script from the root of the package."
  exit 1
fi

ffmpeg -filters > ./test/fixtures/ffmpeg-filters.out

node ./scripts/updateFiltersJSONFixture.js

exit $?
