import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";
import Layout from "@theme/Layout";
import clsx from "clsx";
import type { ReactNode } from "react";

import styles from "./index.module.css";

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();

    return (
        <header className={clsx("hero hero--primary", styles.heroBanner)} style={{ textAlign: "center" }}>
            <div className="container">
                <Heading as="h1" className="hero__title">
                    {siteConfig.title}
                </Heading>

                <p className="hero__subtitle">{siteConfig.tagline}</p>

                <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
                    <Link className="button button--secondary button--lg" to="/docs/quick-start">
                        Get Started
                    </Link>

                    <Link className="button button--secondary button--lg" href="https://www.npmjs.com/package/nestjs-multi-limiter" target="_blank">
                        npm
                    </Link>

                    <Link className="button button--secondary button--lg" href="https://github.com/TarhunchiKKK/nestjs-multi-limiter" target="_blank">
                        GitHub
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default function Home(): ReactNode {
    return (
        <Layout description="Description will go into a meta tag in <head />">
            <HomepageHeader />

            <main>
                <HomepageFeatures />
            </main>
        </Layout>
    );
}
