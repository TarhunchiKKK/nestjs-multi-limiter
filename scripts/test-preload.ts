import { plugin } from "bun";
import bunPluginSwc from "bun-plugin-swc";

plugin(
    bunPluginSwc({
        swc: {
            jsc: {
                parser: {
                    syntax: "typescript",
                    decorators: true
                },
                transform: {
                    legacyDecorator: true,
                    decoratorMetadata: true
                },
                keepClassNames: true
            }
        }
    })
);
