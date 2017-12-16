#!/bin/bash
declare projectDir=$(git rev-parse --show-toplevel)
declare alminDir="${projectDir}/packages/almin"
declare srcDir="${projectDir}/packages/almin/lib/src"
declare docDir="${projectDir}/docs"
# add build result
function addDoc(){
    declare filePath=$1;
    declare fileName=$(basename ${filePath} ".d.ts")
    $(npm bin)/docco --blocks -t ${projectDir}/tools/d.ts-markdown.jst ${filePath} --output ${projectDir}/__obj/docs
    mv ${projectDir}/__obj/docs/**${fileName}*.html ${projectDir}/docs/_${fileName}API.md
    echo "Create: ${docDir}/api/_${fileName}API.md"
}
cd "${alminDir}"
npm run build
cd "${projectDir}"
# update
addDoc "${srcDir}/Context.d.ts"
addDoc "${srcDir}/UseCaseExecutor.d.ts"
addDoc "${srcDir}/LifeCycleEventHub.d.ts"
addDoc "${srcDir}/Dispatcher.d.ts"
addDoc "${srcDir}/DispatcherPayloadMeta.d.ts"
addDoc "${srcDir}/Store.d.ts"
addDoc "${srcDir}/UILayer/StoreGroup.d.ts"
addDoc "${srcDir}/UseCase.d.ts"
addDoc "${srcDir}/UseCaseContext.d.ts"
