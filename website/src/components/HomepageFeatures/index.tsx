import Heading from "@theme/Heading";
import clsx from "clsx";
import { AudioLinesIcon, FoldHorizontalIcon, SlidersHorizontalIcon } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./styles.module.css";

type FeatureItem = {
    title: string;
    Svg: React.ComponentType<React.ComponentProps<"svg">>;
    description: ReactNode;
};

const FeatureList: FeatureItem[] = [
    {
        title: "5 Core Algorithms",
        Svg: SlidersHorizontalIcon,
        description: <>Fixed Window, Token Bucket, Sliding Window Counter, Sliding Window Log, Leaky Bucket</>
    },
    {
        title: "Dynamically Configurable",
        Svg: AudioLinesIcon,
        description: <>Options factories system allows you to dynamically configure limits at runtime (on the fly pre request)</>
    },
    {
        title: "Race-Condition Safe",
        Svg: FoldHorizontalIcon,
        description: <>Redis storage executes Lua-scripts, preventing race conditions in multi-instance deployments</>
    }
];

function Feature({ title, Svg, description }: FeatureItem) {
    return (
        <div className={clsx("col col--4")}>
            <div className="text--center">
                <Svg className={styles.featureSvg} color="#359962" role="img" />
            </div>

            <div className="text--center padding-horiz--md">
                <Heading as="h3">{title}</Heading>

                <p>{description}</p>
            </div>
        </div>
    );
}

export default function HomepageFeatures(): ReactNode {
    return (
        <section className={styles.features}>
            <div className="container">
                <div className="row">
                    {FeatureList.map((props, idx) => (
                        <Feature key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}
