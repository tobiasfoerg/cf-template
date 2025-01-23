import { defineConfig } from "vite";

import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(() => ({
	build: {
		outDir: "dist",
		emptyOutDir: true,
	},
	resolve: {
		externalConditions: ["workerd", "worker"],
	},
	plugins: [cloudflare(), reactRouter(), tsconfigPaths(), tailwindcss()],
}));
