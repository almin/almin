/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react");

const siteConfig = require(`${process.cwd()}/siteConfig.js`);

const CompLibrary = require("../core/CompLibrary.js");

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

Button.defaultProps = {
    target: "_self"
};

class HomeSplash extends React.Component {
    render() {
        const newURL =
            typeof window !== "undefined" && typeof window.location !== "undefined"
                ? redirectURL(window.location.path, "en")
                : undefined;
        const message = newURL ? (
            <small>
                Do you mean: <a href={newURL}>{newURL}</a>
            </small>
        ) : (
            <small>This page is not found</small>
        );
        return (
            <div className="homeContainer">
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
