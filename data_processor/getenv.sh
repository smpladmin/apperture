#!/bin/bash


if ! command -v npx &> /dev/null
then
    echo "npx could not be found. Install node/npm/npx using https://github.com/nvm-sh/nvm"
    exit
fi

npx --yes dotenv-vault pull --dotenvMe $DP_DOTENVME
rm -f $( dirname -- "$0"; )/.gitignore
