#!/bin/bash
declare projectDir=$(git rev-parse --show-toplevel)
declare srcDir="${projectDir}/src"
declare docDir="${projectDir}/docs"
declare APIREADME="${docDir}/api/README.md"
declare THEME="${projectDir}/node_modules/documentation-markdown-api-theme/lib/"
declare tmpfile=$(mktemp)
# Update sequential
echo ${APIREADME}
# add build result
function addDoc(){
    declare filePath=$1;
    declare sectionName=$2
    echo "Add documentation: ${filePath}"
    $(npm bin)/documentation build --access public  --theme ${THEME} -f html -o ${tmpfile} "${filePath}"
    cat ${tmpfile} | $(npm bin)/add-text-to-markdown ${APIREADME} --section "${sectionName}" -w
}
# update
addDoc "${srcDir}/index.js" "API Reference"