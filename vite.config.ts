import { defineConfig } from "vite";

import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { iconsSpritesheet } from "vite-plugin-icons-spritesheet";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(() => ({
	esbuild: {
		target: "es2022",
	},
	build: {
		minify: true,
		sourcemap: true,
	},
	server: {
		warmup: {
			clientFiles: ["./src/entry.client.tsx", "./src/root.tsx", "./src/routes/**/*.tsx"],
			ssrFiles: ["./worker/app.ts", "./src/entry.server.tsx", "./src/routes/**/*.tsx"],
		},
	},
	plugins: [
		cloudflare({
			viteEnvironment: { name: "ssr" },
		}),
		reactRouter(),
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
