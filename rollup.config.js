import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";


export default {
    input: "build/live-ride-measurements.js",
    output: {
        dir: "./release",
        format: "iife"
    },
    plugins: [
        nodeResolve(),
        commonjs()
    ]
};