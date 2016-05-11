#!/bin/bash
declare projectDir=$(git rev-parse --show-toplevel)
declare srcDir="${projectDir}/src"
declare docDir="${projectDir}/docs"
declare APIREADME="${docDir}/api/README.md"
# Update sequential
echo ${APIREADME}
$(npm bin)/documentation-wrapper readme --access public --readme-file "${APIREADME}" --section "Dispatcher class" "${srcDir}/Dispatcher.js"
$(npm bin)/documentation-wrapper readme --access public --readme-file "${APIREADME}" --section "Store class" "${srcDir}/Store.js"
$(npm bin)/documentation-wrapper readme --access public --readme-file "${APIREADME}" --section "StoreGroup class" "${srcDir}/UILayer/StoreGroup.js"
$(npm bin)/documentation-wrapper readme --access public --readme-file "${APIREADME}" --section "Context class" "${srcDir}/Context.js"
$(npm bin)/documentation-wrapper readme --access public --readme-file "${APIREADME}" --section "UseCase class" "${srcDir}/UseCase.js"