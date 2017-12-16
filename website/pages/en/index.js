/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react");

const CompLibrary = require("../../core/CompLibrary.js");
const MarkdownBlock = CompLibrary.MarkdownBlock;
/* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const siteConfig = require(`${process.cwd()}/siteConfig.js`);

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
        return (
            <div className="homeContainer">
                <div className="homeSplashFade">
                    <div className="wrapper homeWrapper">
                        <div className="projectLogo">
                            <img src={`${siteConfig.baseUrl}img/almin.svg`} />
                        </div>
                        <div className="inner">
                            <h2 className="projectTitle">
                                {siteConfig.title}
                                <small>{siteConfig.tagline}</small>
                            </h2>
                            <div className="section promoSection">
                                <div className="promoRow">
                                    <div className="pluginRowBlock">
                                        <Button
                                            href={`${siteConfig.baseUrl}docs/${
                                                this.props.language
                                            }/getting-started.html`}
                                        >
                                            Getting Started
                                        </Button>
                                        <Button
                                            href={`${siteConfig.baseUrl}docs/${
                                                this.props.language
                                            }/example-projects.html`}
                                        >
                                            Take a tutorial
                                        </Button>
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
        const language = this.props.language || "en";
        const showcase = siteConfig.users
            .filter(user => {
                return user.pinned;
            })
            .map(user => {
                return (
                    <a key={user.infoLink} href={user.infoLink}>
                        <img src={user.image} title={user.caption} />
                    </a>
                );
            });

        return (
            <div>
                <HomeSplash language={language} />
                <div className="mainContainer">
                    <Container padding={["bottom", "top"]}>
                        <GridBlock
                            align="center"
                            contents={[
                                {
                                    title: "Scalable",
                                    content: "This is the content of my feature"
                                },
                                {
                                    title: "Testable",
                                    content: "Testable"
                                },
                                {
                                    title: "Debuggable",
                                    content: "Testable"
                                },
                                {
                                    title: "Layered Architecture",
                                    content: "DDD CQRS"
                                }
                            ]}
                            layout="twoColumn"
                        />
                    </Container>

                    <div className="productShowcaseSection paddingBottom" style={{ textAlign: "center" }}>
                        <h2>Feature Callout</h2>
                        <MarkdownBlock>These are features of this project</MarkdownBlock>
                    </div>
                    <Container padding={["bottom", "top"]} background="dark">
                        <GridBlock
                            contents={[
                                {
                                    title: "The Concept of Almin",
                                    content:
                                        "The concept is described in [The Concept of Almin](http://azu.github.io/slide/2017/almin/concept-of-almin.html) slide.\n " +
                                        "-  Write **Your domain** in **Your code**\n" +
                                        "- Split up **Read stack** and **Write stack**\n" +
                                        "- **Unidirectional** data flow\n" +
                                        "- Prefer **Readable code** to **Writable code**\n" +
                                        "- **Monitor everything**",
                                    image: `${siteConfig.baseUrl}img/the-concept-of-almin.png`,
                                    imageAlign: "right",
                                    imageLink: "http://azu.github.io/slide/2017/almin/concept-of-almin.html"
                                }
                            ]}
                        />
                    </Container>
                    <Container padding={["bottom", "top"]} background="light">
                        <GridBlock
                            contents={[
                                {
                                    title: "Large scalable app",
                                    content: "Large scale app need to read time rather than write time.",
                                    image: `${siteConfig.baseUrl}docs/assets/almin-architecture.png`,
                                    imageAlign: "left"
                                }
                            ]}
                        />
                    </Container>
                    <div className="productShowcaseSection paddingBottom">
                        <h2>{"Who's Using This?"}</h2>
                        <p>This project is used by all these people</p>
                        <div className="logos">{showcase}</div>
                        <div className="more-users">
                            <a className="button" href={`${siteConfig.baseUrl + this.props.language}/` + `users.html`}>
                                More {siteConfig.title} Users
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = Index;
