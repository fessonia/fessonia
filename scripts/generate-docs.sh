#!/bin/bash

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

./node_modules/.bin/jsdoc --configure ".jsdoc.json" --destination "./docs/fessonia/${PACKAGE_VERSION}" --verbose

if [ ! -e 'docs/fessonia/current' ]; then
  $(cd docs/fessonia && ln -s "${PACKAGE_VERSION}" "current")
fi

if [ ! -e 'docs/index.html' ]; then
  $(cd docs && ln -s "./fessonia/${PACKAGE_VERSION}/index.html" "index.html")
fi

cd ${current_dir}
