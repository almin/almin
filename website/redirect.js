// Old path => New path
module.exports = function(path, lang) {
    console.log(path, lang);
    const REDIRECT = {
        "introduction/components": `/docs/${lang}/components.html`,
        "introduction/hello-world": `/docs/${lang}/hello-world.html`,
        "tips/strict-mode": `/docs/${lang}/strict-mode.html`,
        "tips/logging": `/docs/${lang}/logging.html`,
        "tips/performance-profile": `/docs/${lang}/performance-profile.html`,
        "tips/nesting-usecase": `/docs/${lang}/nesting-usecase.html`,
        "tips/usecase-lifecycle": `/docs/${lang}/usecase-lifecycle.html`,
        "usecase-is-already-released": `/docs/${lang}/warning-usecase-is-already-released.html`,
        "api/Dispatcher": `/docs/${lang}/context-api.html`,
        "api/DispatcherPayloadMeta": `/docs/${lang}/dispatcherpayloadmeta-api.html`,
        "api/Store": `/docs/${lang}/store-api.html`,
        "api/StoreGroup": `/docs/${lang}/storegroup-api.html`,
        "api/UseCase": `/docs/${lang}/usecase-api.html`,
        "api/Context": `/docs/${lang}/context-api.html`,
        "api/UseCaseContext": `/docs/${lang}/usecasecontext-api.html`,
        "api/UseCaseExecutor": `/docs/${lang}/usecaseexecutor-api.html`,
        "api/LifeCycleEventHub": `/docs/${lang}/lifecycleeventhub-api.html`,
        GLOSSARY: `/docs/${lang}/glossary`
    };
    const OLD_PATH_LIST = Object.keys(REDIRECT);
    for (let i = 0; i < OLD_PATH_LIST.length; i++) {
        const OLD_PATH = OLD_PATH_LIST[i];
        const NEW_URL = REDIRECT[OLD_PATH];
        if (path.indexOf(OLD_PATH) !== -1) {
            return NEW_URL;
        }
    }
    return undefined;
};
