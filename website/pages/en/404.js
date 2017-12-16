/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react");

const siteConfig = require(`${process.cwd()}/siteConfig.js`);

const CompLibrary = require("../../core/CompLibrary.js");

// old path to new path
const redirectURL = require(`${process.cwd()}/redirect.js`);

class Button extends React.Component {
    render() {
        return (
            <div className="pluginWrapper buttonWrapper">
                <a className="button" href={this.props.href} target={this.props.target}>
                    {this.props.children}
                </a>
            </div>
        );
    }
}

class RedirectScript extends React.Component {
    render() {
        return (
            <script
                dangerouslySetInnerHTML={{
                    __html: `
function redirectURL(path) {
    const REDIRECT = {
        "introduction/components": "/docs/en/components.html",
        "introduction/hello-world": "/docs/en/hello-world.html",
        "tips/strict-mode": "/docs/en/strict-mode.html",
        "tips/logging": "/docs/en/logging.html",
        "tips/performance-profile": "/docs/en/performance-profile.html",
        "tips/nesting-usecase": "/docs/en/nesting-usecase.html",
        "tips/usecase-lifecycle": "/docs/en/usecase-lifecycle.html",
        "usecase-is-already-released": "/docs/en/warning-usecase-is-already-released.html",
        "api/Dispatcher": "/docs/en/context-api.html",
        "api/DispatcherPayloadMeta": "/docs/en/dispatcherpayloadmeta-api.html",
        "api/Store": "/docs/en/store-api.html",
        "api/StoreGroup": "/docs/en/storegroup-api.html",
        "api/UseCase": "/docs/en/usecase-api.html",
        "api/Context": "/docs/en/context-api.html",
        "api/UseCaseContext": "/docs/en/usecasecontext-api.html",
        "api/UseCaseExecutor": "/docs/en/usecaseexecutor-api.html",
        "api/LifeCycleEventHub": "/docs/en/lifecycleeventhub-api.html",
        GLOSSARY: "/docs/en/glossary"
    };
    var OLD_PATH_LIST = Object.keys(REDIRECT);
    for (var i = 0; i < OLD_PATH_LIST.length; i++) {
        const OLD_PATH = OLD_PATH_LIST[i];
        const NEW_URL = REDIRECT[OLD_PATH];
        if (path.indexOf(OLD_PATH) !== -1) {
            return NEW_URL;
        }
    }
    return undefined;
}

const newURL =
    typeof window !== "undefined" && typeof window.location !== "undefined"
        ? redirectURL(window.location.pathname)
        : undefined;
if(newURL){
    location.replace(newURL);
}
`
                }}
            />
        );
    }
}

Button.defaultProps = {
    target: "_self"
};

class HomeSplash extends React.Component {
    render() {
        const message = <small>This page is not found</small>;
        return (
            <div className="homeContainer">
                <RedirectScript />
                <div className="homeSplashFade">
                    <div className="wrapper homeWrapper">
                        <div className="inner">
                            <h2 className="projectTitle">
                                404 Not Found
                                {message}
                            </h2>
                            <div className="section promoSection">
                                <div className="promoRow">
                                    <div className="pluginRowBlock">
                                        <Button href={`${siteConfig.baseUrl}`}>Go to Top</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class Index extends React.Component {
    render() {
        return (
            <div>
                <div className="mainContainer">
                    <HomeSplash />
                </div>
            </div>
        );
    }
}

module.exports = Index;
