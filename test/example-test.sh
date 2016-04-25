#!/bin/bash
set -e
NODE_ENV=production
rootDir=$(git rev-parse --show-toplevel)
cd ${rootDir}/example/shopping-cart && npm it
cd ${rootDir}/example/todomvc && npm it