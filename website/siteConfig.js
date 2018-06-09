const users = [
    {
        caption: "Almin",
        image: "img/user/almin.svg",
        infoLink: "https://almin.js.org/",
        pinned: true
    },
    {
        caption: "Faao",
        image: "img/user/faao.png",
        infoLink: "https://github.com/azu/faao",
        pinned: true
    }
];

const siteConfig = {
    title: "Almin" /* title for your website */,
    tagline: "Flux/CQRS patterns for JavaScript application.",
    url: "https://almin.github.io" /* your website url */,
    baseUrl: "/" /* base url for your project */,
    projectName: "almin",
    organizationName: "almin",
    editUrl: "https://github.com/almin/almin/edit/master/docs/",
    headerLinks: [
        { search: true },
        { doc: "getting-started", label: "Docs" },
        { doc: "api", label: "API" },
        { blog: true, label: "Blog" },
        { page: "help", label: "Help" },
        {
            href: "https://github.com/almin/almin",
            label: "GitHub"
        }
    ],
    users,
    /* path to images for header/footer */
    headerIcon: "img/icon-highlight.png",
    footerIcon: "img/almin.svg",
    favicon: "img/favicon.png",
    /* colors for website */
    colors: {
        primaryColor: "#060606",
        secondaryColor: "#201a1a"
    },
    // This copyright info is used in /core/Footer.js and blog rss/atom feeds.
    copyright: `Copyright © ${new Date().getFullYear()} Your Name or Your Company Name`,
    highlight: {
        // Highlight.js theme to use for syntax highlighting in code blocks
        theme: "default"
    },
    algolia: {
        // https://community.algolia.com/docsearch/documentation/
        // https://github.com/algolia/docsearch-configs/blob/master/configs/almin_js.json
        apiKey: "78de78c8711e82c99d77045672c84dcb",
        indexName: "almin_js"
    },
    scripts: ["https://buttons.github.io/buttons.js"],
    // You may provide arbitrary config keys to be used as needed by your template.
    repoUrl: "https://github.com/almin/almin"
};

module.exports = siteConfig;
