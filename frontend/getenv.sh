#!/bin/bash

if ! command -v npx &> /dev/null
then
    printf "npx command not found.\nInstall node/npm/npx using https://github.com/nvm-sh/nvm and then run this file.\n"
    exit
fi

npx --yes dotenv-vault pull --dotenvMe $FE_DOTENVME
rm -f $( dirname -- "$0"; )/.gitignore
