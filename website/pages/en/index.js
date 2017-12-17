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
                                    image: `${siteConfig.baseUrl}img/icon/mbri-globe.svg`,
                                    imageAlign: "top",
                                    content: "Work with Medium-small(1,000LOC) – Large(100,000LOC) size project"
                                },
                                {
                                    title: "Testable",
                                    image: `${siteConfig.baseUrl}img/icon/mbri-refresh.svg`,
                                    imageAlign: "top",
                                    content: "Can Implement UseCase/Store/Domain as separated components"
                                },
                                {
                                    title: "Debuggable",
                                    image: `${siteConfig.baseUrl}img/icon/mbri-search.svg`,
                                    imageAlign: "top",
                                    content: `[Logger](${siteConfig.baseUrl}docs/${
                                        this.props.language
                                    }/logging.html), [DevTools](https://github.com/almin/almin-devtools), [Performance monitoring](${
                                        siteConfig.baseUrl
                                    }docs/${this.props.language}/logging.html)`
                                },
                                {
                                    title: "Layered Architecture",

                                    image: `${siteConfig.baseUrl}img/icon/mbri-layers.svg`,
                                    imageAlign: "top",
                                    content: "Work with DDD/CQRS architecture"
                                }
                            ]}
                            layout="twoColumn"
                        />
                    </Container>

                    <div className="productShowcaseSection paddingBottom">
                        <h2>State management library for JavaScript application</h2>
                        <MarkdownBlock>{`
Now, We can implement web app with [Flux](https://github.com/facebook/flux),
[Redux](https://github.com/reactjs/redux), [MobX](https://github.com/mobxjs/mobx) etc.
But, We often hear a story like following:

> The control flow of *[[LIBRARY]]* is cool!<br>
> But how to implement domain logic?

Almin aim to help you focus domain logic on your application.
`}</MarkdownBlock>
                    </div>
                    <Container padding={["bottom", "top"]} background="dark">
                        <GridBlock
                            contents={[
                                {
                                    title: "The Concept of Almin",
                                    content: `The concept is described in [The Concept of Almin](http://azu.github.io/slide/2017/almin/concept-of-almin.html) slide.

- Write **Your domain** in **Your code**
- Split up **Read stack** and **Write stack**
- **Unidirectional** data flow
- Prefer **Readable code** to **Writable code**
- **Monitor everything**

For more details, see [The Concept of Almin](http://azu.github.io/slide/2017/almin/concept-of-almin.html).
`,
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
                                    title: "Focus your domain",
                                    content: `
You can write **Your domain** in **Your code**.
It means that you can control domain layer.

- You can write **your domain** with **Pure JavaScript**
- Your domain is **not need** to subclass of Almin things

Almin support only application layer.

- Application layer use your domain model

If you stop to use Almin, you **don't need to rewrite** your domain
`,
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
