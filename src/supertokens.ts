import { ComponentOverrideMap, PluginRouteHandler, SuperTokensPlugin, SuperTokensPublicPlugin } from "@plugins";
type SuperTokensConfig = {
	apiPath: string;
	plugins: SuperTokensPlugin[];
};

type SuperTokensPublicConfig = Pick<SuperTokensConfig, "apiPath">;

export class SuperTokens {
	private static instance: SuperTokens | undefined;
	public componentOverrides: ComponentOverrideMap;
	public pluginList: SuperTokensPublicPlugin[];
	public pluginRouteHandlers: PluginRouteHandler[] = [];

	private constructor(config: SuperTokensConfig) {
		const { plugins } = config;

		this.componentOverrides = {};

		for (const plugin of plugins) {
			if (plugin.componentOverrides !== undefined) {
				this.componentOverrides = {
					...this.componentOverrides,
					...plugin.componentOverrides,
				};
			}
		}

		this.pluginList = plugins.map(getPublicPlugin);

		const publicConfig = getPublicConfig(config);

		// iterated separately so we can pass the instance plugins  as reference so they always have access to the latest
		for (let pluginIndex = 0; pluginIndex < this.pluginList.length; pluginIndex += 1) {
			const pluginRouteHandlers = plugins[pluginIndex].routeHandlers;
			if (pluginRouteHandlers) {
				let handlers: PluginRouteHandler[] = [];
				if (typeof pluginRouteHandlers === "function") {
					const result = pluginRouteHandlers(publicConfig, this.pluginList);
					if (result.status === "ERROR") {
						throw new Error(result.message);
					}
					handlers = result.routeHandlers;
				} else {
					handlers = pluginRouteHandlers;
				}

				this.pluginRouteHandlers.push(...handlers);
			}
		}
	}

	public static getInstanceOrThrow(): SuperTokens {
		if (!SuperTokens.instance) {
			throw new Error("SuperTokens not initialized");
		}
		return SuperTokens.instance;
	}

	public static reset(): void {
		SuperTokens.instance = undefined;
	}

	public static init(config: SuperTokensConfig): SuperTokens {
		if (SuperTokens.instance) {
			return SuperTokens.instance;
		}

		SuperTokens.instance = new SuperTokens(config);

		return SuperTokens.instance;
	}
}

function getPublicPlugin(plugin: SuperTokensPlugin): SuperTokensPublicPlugin {
	return {
		id: plugin.id,
		initialized: plugin.init ? false : true, // since the init method is optional, we default to true
		version: plugin.version,
		exports: plugin.exports,
	};
}

function getPublicConfig(config: SuperTokensConfig): SuperTokensPublicConfig {
	return {
		apiPath: config.apiPath,
	};
}
