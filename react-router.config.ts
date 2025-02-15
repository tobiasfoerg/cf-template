import type { Config } from "@react-router/dev/config";

export default {
	appDirectory: "src",
	buildDirectory: "dist",
	future: {
		unstable_optimizeDeps: true,
		unstable_splitRouteModules: true,
		unstable_viteEnvironmentApi: true,
	},
} satisfies Config;
