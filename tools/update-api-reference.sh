#!/bin/bash
declare projectDir=$(git rev-parse --show-toplevel)
declare srcDir="${projectDir}/lib"
declare docDir="${projectDir}/docs"
# add build result
function addDoc(){
    declare filePath=$1;
    declare fileName=$(basename ${filePath} "d.ts")
    $(npm bin)/docco --blocks -t ${projectDir}/tools/d.ts-markdown.jst ${filePath} --output ${projectDir}/__obj/docs
    mv ${projectDir}/__obj/docs/*${fileName}*.html ${projectDir}/docs/api/${fileName}md
    echo "Create: ${docDir}/api/${fileName}md"
}
npm run build
# update
addDoc "${srcDir}/Context.d.ts"
addDoc "${srcDir}/Dispatcher.d.ts"
addDoc "${srcDir}/DispatcherPayloadMeta.d.ts"
addDoc "${srcDir}/Store.d.ts"
