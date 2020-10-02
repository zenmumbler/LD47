import resolve from "@rollup/plugin-node-resolve";
import tsc from "rollup-plugin-typescript2";
import typescript from "typescript";

export default [
	{
		input: `src/ld47.ts`,
		output: [{
			file: `build/ld47.js`,
			format: "iife",
			name: "moduletest",
		}],
		plugins: [
			resolve({ browser: true }),
			tsc({ typescript })
		]
	}
];
