/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react");

class Footer extends React.Component {
    render() {
        const currentYear = new Date().getFullYear();
        return (
            <footer className="nav-footer" id="footer">
                <section className="sitemap">
                    <a href={this.props.config.baseUrl} className="nav-home">
                        <img
                            src={this.props.config.baseUrl + this.props.config.footerIcon}
                            alt={this.props.config.title}
                            width="66"
                            height="58"
                        />
                    </a>
                    <div>
                        <h5>Docs</h5>
                        <a href={`${this.props.config.baseUrl}docs/${this.props.language}/getting-started.html`}>
                            Getting Started
                        </a>
                        <a href={`${this.props.config.baseUrl}docs/${this.props.language}/example-projects.html`}>
                            Tutorial
                        </a>
                        <a href={`${this.props.config.baseUrl}docs/${this.props.language}/api.html`}>API Reference</a>
                    </div>
                    <div>
                        <h5>Community</h5>
                        <a href={`${this.props.config.baseUrl + this.props.language}/users.html`}>User Showcase</a>
                        <a href="https://stackoverflow.com/questions/tagged/almin" target="_blank">
                            Stack Overflow
                        </a>
                        <a href="https://twitter.com/alminjs" target="_blank">
                            Twitter
                        </a>
                    </div>
                    <div>
                        <h5>GitHub</h5>
                        <a href="https://github.com/almin/almin">GitHub</a>
                        <a href="https://github.com/almin/almin/releases">Releases</a>
                        <a href="https://github.com/almin/almin/issues">Issues</a>
                        <a
                            className="github-button"
                            href={this.props.config.repoUrl}
                            data-icon="octicon-star"
                            data-count-href="/almin/almin/stargazers"
                            data-show-count={true}
                            data-count-aria-label="# stargazers on GitHub"
                            aria-label="Star this project on GitHub"
                        >
                            Star
                        </a>
                    </div>
                </section>

                <section className="copyright">Copyright &copy; {currentYear} azu</section>
            </footer>
        );
    }
}

module.exports = Footer;
