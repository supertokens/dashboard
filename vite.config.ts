import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import * as path from "path";
import packageJson from "./package.json";
import { resolve } from "path";
import svgr from "vite-plugin-svgr";

export default defineConfig(() => {
	return {
		resolve: {
			alias: {
				"@api": resolve(__dirname, "./src/api"),
				"@plugins": resolve(__dirname, "./src/plugins"),
				"@components": resolve(__dirname, "./src/shared/components"),
				"@styles": resolve(__dirname, "./src/shared/styles"),
				"@services": resolve(__dirname, "./src/shared/services"),
				"@features": resolve(__dirname, "./src/features"),
				"@shared": resolve(__dirname, "./src/shared"),
				"@assets": resolve(__dirname, "./src/assets"),
				"@constants": resolve(__dirname, "./src/shared/constants"),
				"@version": resolve(__dirname, "./src/shared/version.ts"),
			},
		},
		root: __dirname,
		plugins: [
			react(),

			svgr({
				include: "**/*.svg",
				svgrOptions: {
					exportType: "named",
					// namedExport: "ReactComponent",
				},
			}),

			dts({
				entryRoot: "src",
				tsconfigPath: path.join(__dirname, "tsconfig.json"),
			}),
			peerDepsExternal(),
		],

		build: {
			outDir: "dist",
			sourcemap: true,
			minify: false,

			emptyOutDir: true,
			commonjsOptions: {
				transformMixedEsModules: true,
			},
			lib: {
				// Could also be a dictionary or array of multiple entry points.
				entry: "src/index.ts",
				fileName: "index",
				name: packageJson.name,
				// Change this to the formats you want to support.
				// Don't forget to update your package.json as well.
				formats: ["es" as const, "cjs" as const],
			},
			rollupOptions: {
				cache: false,
			},
		},
	};
});
