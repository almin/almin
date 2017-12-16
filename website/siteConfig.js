const users = [
    {
        caption: "User1",
        image: "img/almin.svg",
        infoLink: "https://almin.js.org/",
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
        { doc: "getting-started", label: "Docs" },
        { doc: "api", label: "API" },
        { page: "help", label: "Help" },
        {
            href: "https://github.com/almin/almin",
            label: "GitHub"
        }
    ],
    users,
    /* path to images for header/footer */
    headerIcon: "img/almin.svg",
    footerIcon: "img/almin.svg",
    favicon: "img/favicon.png",
    /* colors for website */
    colors: {
        primaryColor: "#060606",
        secondaryColor: "#EAEAEA"
    },
    // This copyright info is used in /core/Footer.js and blog rss/atom feeds.
    copyright: `Copyright © ${new Date().getFullYear()} Your Name or Your Company Name`,
    highlight: {
        // Highlight.js theme to use for syntax highlighting in code blocks
        theme: "default"
    },
    scripts: ["https://buttons.github.io/buttons.js"],
    // You may provide arbitrary config keys to be used as needed by your template.
    repoUrl: "https://github.com/almin/almin"
};

module.exports = siteConfig;
