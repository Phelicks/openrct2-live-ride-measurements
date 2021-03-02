import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";


export default {
    input: "build/ride-length.js",
    output: {
        dir: ".",
        format: "iife"
    },
    plugins: [
        nodeResolve(),
        commonjs()
    ]
};