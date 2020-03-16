/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react");

const CompLibrary = require("../../core/CompLibrary.js");
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const siteConfig = require(`${process.cwd()}/siteConfig.js`);

class Help extends React.Component {
    render() {
        const supportLinks = [
            {
                content: `Learn more using the [documentation on this site.](${siteConfig.baseUrl}docs/${this.props.language}/getting-started.html)`,
                title: "Browse Docs"
            },
            {
                content: "Ask questions about the documentation and project",
                title: "Join the community"
            },
            {
                title: "GitHub",
                content:
                    "At our [GitHub repo](https://github.com/almin/almin) Browse and submit [issues](https://github.com/almin/almin/issues) or [pull requests](https://github.com/almin/almin/pulls) for bugs you find or any new features you may want implemented. Be sure to also check out our [contributing information](https://github.com/almin/almin/blob/master/.github/CONTRIBUTING.md)."
            }
        ];

        return (
            <div className="docMainWrapper wrapper">
                <Container className="mainContainer documentContainer postContainer">
                    <div className="post">
                        <header className="postHeader">
                            <h2>Need help?</h2>
                        </header>
                        <p>This project is maintained by a dedicated group of people.</p>
                        <GridBlock contents={supportLinks} layout="threeColumn" />
                    </div>
                </Container>
            </div>
        );
    }
}

module.exports = Help;
