import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
    tutorialSidebar: [
        "overview",
        "quick-start",
        {
            type: "category",
            label: "Configuration",
            description: "Learn how to configure module.",
            collapsed: false,
            items: ["configuration/module-configuration", "configuration/default-configuration", "configuration/async-configuration"]
        },
        {
            type: "category",
            label: "Decorators",
            description: "Learn about library decorators.",
            collapsed: false,
            items: ["decorators/rate-limit", "decorators/skip-rate-limit"]
        },
        {
            type: "category",
            label: "Redis Integration",
            description: "Learn how to integrate rate limiting module with Redis.",
            collapsed: false,
            items: ["redis-integration/overview", "redis-integration/via-object", "redis-integration/via-provider"]
        },
        {
            type: "category",
            label: "Custom Providers",
            description: "Learn how to implement custom rate limiting logic.",
            collapsed: false,
            items: ["custom-providers/overview", "custom-providers/key-extractors", "custom-providers/error-factories", "custom-providers/options-factories"]
        },
        {
            type: "category",
            label: "Resources",
            description: "Here is some theory about rate limiting and this library.",
            collapsed: false,
            items: ["resources/comprehensive-guides", "resources/use-cases", "resources/example-app"]
        }
    ]
};

export default sidebars;
