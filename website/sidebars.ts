import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

export default {
    docs: [
        "overview",
        "quick-start",
        {
            type: "category",
            label: "Configuration",
            link: {
                type: "generated-index",
                description: "Learn how to configure module."
            },
            collapsed: false,
            items: ["configuration/module-configuration", "configuration/default-configuration", "configuration/async-configuration"]
        },
        {
            type: "category",
            label: "Decorators",
            link: {
                type: "generated-index",
                description: "Learn about library decorators."
            },
            collapsed: false,
            items: ["decorators/rate-limit", "decorators/skip-rate-limit"]
        },
        {
            type: "category",
            label: "Redis Integration",
            collapsed: false,
            link: {
                type: "generated-index",
                description: "Learn how to integrate rate limiting module with Redis."
            },
            items: ["redis-integration/overview", "redis-integration/via-object", "redis-integration/via-provider"]
        },
        {
            type: "category",
            label: "Custom Providers",
            link: {
                type: "generated-index",
                description: "Learn how to implement custom rate limiting logic."
            },
            collapsed: false,
            items: ["custom-providers/overview", "custom-providers/key-extractors", "custom-providers/error-factories", "custom-providers/options-factories"]
        },
        {
            type: "category",
            label: "Resources 📔",
            link: {
                type: "generated-index",
                description: "Here is some theory about rate limiting and this library."
            },
            collapsed: false,
            items: ["resources/comprehensive-guides", "resources/use-cases", "resources/example-app"]
        }
    ]
} satisfies SidebarsConfig;
