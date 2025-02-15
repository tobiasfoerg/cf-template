import { defineConfig } from "vite";

import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { iconsSpritesheet } from "vite-plugin-icons-spritesheet";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(() => ({
	ssr: {
		resolve: {
			conditions: ["workerd", "worker", "browser"],
		},
	},
	resolve: {
		mainFields: ["browser", "module", "main"],
	},
	build: {
		minify: true,
	},
	optimizeDeps: {
		exclude: ["node:async_hooks"],
	},
	plugins: [
		cloudflare({
			viteEnvironment: { name: "worker" },
		}),
		reactRouter().map((pl) => ({
			...pl,
			configureServer: pl.name === "react-router" ? undefined : pl.configureServer,
		})),
		tsconfigPaths(),
		tailwindcss(),
		iconsSpritesheet({
			inputDir: "./resources/icons",
			outputDir: "./src/components/icon/icons",
			fileName: "icon.svg",
			withTypes: true,
			formatter: "biome",
			iconNameTransformer(fileName) {
				return fileName.replace(/\.svg$/, "");
			},
		}),
	],
}));
