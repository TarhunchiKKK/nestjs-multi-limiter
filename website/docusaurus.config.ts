import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";

export default {
    title: "NestJS Multi Limiter",
    tagline: "Rate limiting module for NestJS framework (Node.js)",
    favicon: "img/favicon.ico",
    future: {
        v4: true
    },
    // DOCS: Set the production url of your site here
    url: "https://your-docusaurus-site.example.com",
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: "/",
    organizationName: "TarhunchiKKK",
    projectName: "nestjs-multi-limiter",
    onBrokenLinks: "throw",
    i18n: {
        defaultLocale: "en",
        locales: ["en"]
    },
    presets: [
        [
            "classic",
            {
                blog: false,
                docs: {
                    sidebarPath: "./sidebars.ts"
                },
                theme: {
                    customCss: "./src/css/custom.css"
                }
            } satisfies Preset.Options
        ]
    ],
    themeConfig: {
        colorMode: {
            respectPrefersColorScheme: true
        },
        navbar: {
            logo: {
                src: "img/logo.svg",
                alt: "Logo"
            },
            items: [
                {
                    type: "docSidebar",
                    sidebarId: "docs",
                    position: "left",
                    label: "Documentation"
                },
                {
                    href: "https://github.com/TarhunchiKKK/nestjs-multi-limiter",
                    label: "GitHub",
                    position: "right"
                },
                {
                    href: "https://www.npmjs.com/package/nestjs-multi-limiter",
                    label: "npm",
                    position: "right"
                }
            ]
        },
        footer: {
            style: "dark",
            links: [
                {
                    title: "Docs",
                    items: [
                        {
                            label: "Quick Start",
                            to: "/docs/quick-start"
                        },
                        {
                            label: "Configuration",
                            to: "/docs/category/configuration"
                        },
                        {
                            label: "Decorators",
                            to: "/docs/category/decorators"
                        },
                        {
                            label: "Redis Integration",
                            to: "/docs/category/redis-integration"
                        },
                        {
                            label: "Custom Providers",
                            to: "/docs/category/custom-providers"
                        }
                    ]
                },
                {
                    title: "Community",
                    items: [
                        {
                            label: "GitHub Issues",
                            href: "https://github.com/nestjs-multi-limiter/issues"
                        },
                        {
                            label: "Stack Overflow",
                            href: "https://stackoverflow.com/questions/tagged/nestjs"
                        },
                        {
                            label: "npm",
                            href: "https://www.npmjs.com/package/nestjs-multi-limiter"
                        }
                    ]
                },
                {
                    title: "More",
                    items: [
                        {
                            label: "GitHub",
                            href: "https://github.com/TarhunchiKKK/nestjs-multi-limiter"
                        },
                        {
                            label: "Resources",
                            to: "/docs/category/resources-"
                        },
                        {
                            label: "Example Application",
                            href: "https://github.com/TarhunchiKKK/nestjs-multi-limiter/tree/main/sample"
                        }
                    ]
                }
            ],
            copyright: `Copyright © ${new Date().getFullYear()} NestJS Multi Limiter, Inc. Built with Docusaurus.`
        },
        prism: {
            theme: prismThemes.dracula,
            darkTheme: prismThemes.dracula
        }
    } satisfies Preset.ThemeConfig
} satisfies Config;
