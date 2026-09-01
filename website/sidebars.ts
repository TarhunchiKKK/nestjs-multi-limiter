import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

// QUESTION: Maybe flat sidebar tree?
export default {
    docs: [
        "overview",
        "quick-start",
        "important-defaults",
        {
            type: "category",
            label: "Configuration",
            link: {
                type: "generated-index",
                description: "Learn how to configure module."
            },
            items: ["configuration/module-configuration", "configuration/default-configuration", "configuration/async-configuration"]
        },
        {
            type: "category",
            label: "Decorators",
            link: {
                type: "generated-index",
                description: "Learn about library decorators."
            },
            items: ["decorators/rate-limit", "decorators/bypass"]
        },
        {
            type: "category",
            label: "Redis Integration",
            link: {
                type: "generated-index",
                description: "Learn how to integrate rate limiting module with Redis."
            },
            items: ["redis-integration/overview", "redis-integration/via-object", "redis-integration/via-provider", "redis-integration/failure-handling"]
        },
        {
            type: "category",
            label: "Custom Providers",
            link: {
                type: "generated-index",
                description: "Learn how to implement custom rate limiting logic."
            },
            items: ["custom-providers/overview", "custom-providers/key-extractors", "custom-providers/error-factories", "custom-providers/options-factories"]
        },
        "swagger-integration",
        {
            type: "category",
            label: "Resources 📔",
            link: {
                type: "generated-index",
                description: "Here is some theory about rate limiting and this library."
            },
            collapsed: false,
            items: ["resources/algorithms", "resources/example-app"]
        }
    ]
} satisfies SidebarsConfig;
