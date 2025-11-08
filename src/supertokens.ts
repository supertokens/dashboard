import { Implementation } from "./implementation";
import { version } from "./version";
import {
	SuperTokensConfig,
	SuperTokensPublicConfig,
	SuperTokensPluginRouteHandler,
	NormalizedSuperTokensConfig,
	SuperTokensPlugin,
} from "./types";
import { getNormalizedSuperTokensConfig, getPublicConfig, getPublicPlugin } from "./utils";
import { OverrideableBuilder } from "supertokens-js-override";
import { ComponentOverrideMap } from "@plugins";

export class SuperTokens {
	private static instance: SuperTokens | undefined;
	static overridableComponents: any = {};

	private config: NormalizedSuperTokensConfig;

	public pluginRouteHandlers: SuperTokensPluginRouteHandler[] = [];

	private constructor(config: SuperTokensConfig) {
		const normalizedConfig = getNormalizedSuperTokensConfig(config);
		const loadedPlugins = loadPlugins({
			config: normalizedConfig,
			version,
		});

		this.config = applyPlugins(normalizedConfig, loadedPlugins);

		Implementation.init({ override: this.config.override?.functions });

		if (this.config.override?.components) {
			const builder = new OverrideableBuilder<ComponentOverrideMap>(SuperTokens.overridableComponents);

			builder.override(this.config.override?.components as any);
			SuperTokens.overridableComponents = builder.build();
		}

		const publicPlugins = loadedPlugins.map(getPublicPlugin);
		const pluginsRouteHandlers = loadedPlugins
			.map((plugin) => plugin.routeHandlers)
			.filter((handler) => handler !== undefined);
		for (const pluginRouteHandlers of pluginsRouteHandlers) {
			let handlers: SuperTokensPluginRouteHandler[] = [];

			if (typeof pluginRouteHandlers === "function") {
				const result = pluginRouteHandlers(this.getPublicConfig(), publicPlugins);
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

	public getPublicConfig(): SuperTokensPublicConfig {
		return getPublicConfig(this.config);
	}
}

export function applyPlugins(
	config: NormalizedSuperTokensConfig,
	plugins: SuperTokensPlugin[]
): NormalizedSuperTokensConfig {
	let configLayers = [];
	let componentsLayers = [];
	let functionsLayers = [];

	for (const { overrides } of plugins) {
		if (!overrides) continue;

		if (overrides.config !== undefined) {
			configLayers.push(overrides.config as any);
		}
		if (overrides.components !== undefined) {
			componentsLayers.push(overrides.components as any);
		}
		if (overrides.functions !== undefined) {
			functionsLayers.push(overrides.functions as any);
		}
	}

	let overriddenConfig = { ...config };
	for (const layer of configLayers) {
		overriddenConfig = { ...overriddenConfig, ...layer(getPublicConfig(overriddenConfig)) };
	}

	functionsLayers = functionsLayers.filter((layer) => layer !== undefined);
	if (functionsLayers.length > 0) {
		overriddenConfig.override = {
			...overriddenConfig.override,
			functions: (oI: any, builder: OverrideableBuilder<any>) => {
				for (const layer of functionsLayers) {
					builder.override(layer as any);
				}
				return oI;
			},
		};
	}

	componentsLayers = componentsLayers.filter((layer) => layer !== undefined);
	if (componentsLayers.length > 0) {
		overriddenConfig.override = {
			...overriddenConfig.override,
			components: (oI: any, builder: OverrideableBuilder<any>) => {
				// Wrap each layer to provide bound functions
				for (const layer of componentsLayers) {
					builder.override(layer);
				}

				return oI;
			},
		};
	}
	functionsLayers.push(config.override?.functions);
	componentsLayers.push(config.override?.components);

	return overriddenConfig;
}

/**
 * Processes the list of plugins, resolving dependencies, applying overrides, and collecting route handlers.
 */
export function loadPlugins({
	config,
	version,
}: {
	config: NormalizedSuperTokensConfig;
	version: string;
}): SuperTokensPlugin[] {
	const finalPluginList: SuperTokensPlugin[] = [];
	const seenPlugins: Set<string> = new Set();

	for (const plugin of config.plugins) {
		if (seenPlugins.has(plugin.id)) {
			continue;
		}

		const dependencies = getPluginDependencies({
			plugin,
			config,
			pluginsAbove: finalPluginList,
			version,
		});
		finalPluginList.push(...dependencies);

		for (const dep of dependencies) {
			seenPlugins.add(dep.id);
		}
	}

	const duplicatePluginIds = finalPluginList.filter((plugin, index) =>
		finalPluginList.some((elem, idx) => elem.id === plugin.id && idx !== index)
	);
	if (duplicatePluginIds.length > 0) {
		throw new Error(`Duplicate plugin IDs: ${duplicatePluginIds.map((plugin) => plugin.id).join(", ")}`);
	}

	return finalPluginList;
}

export function getPluginDependencies({
	plugin,
	config,
	pluginsAbove,
	version,
}: {
	plugin: SuperTokensPlugin;
	config: NormalizedSuperTokensConfig;
	pluginsAbove: SuperTokensPlugin[];
	version: string;
}): SuperTokensPlugin[] {
	const publicConfig = getPublicConfig(config);

	function recurseDependencies(
		plugin: SuperTokensPlugin,
		dependencies?: SuperTokensPlugin[],
		visited?: Set<string>
	): SuperTokensPlugin[] {
		if (!dependencies) {
			dependencies = [];
		}
		if (!visited) {
			visited = new Set();
		}
		if (visited.has(plugin.id)) {
			return dependencies;
		}
		visited.add(plugin.id);

		if (plugin.dependencies) {
			// Get the current plugin's dependencies
			const result = plugin.dependencies(publicConfig, pluginsAbove.map(getPublicPlugin), version);
			if (result.status === "ERROR") {
				throw new Error(result.message);
			}

			if (result.pluginsToAdd) {
				// Recurse through each dependency to resolve their dependencies as well
				for (const dep of result.pluginsToAdd) {
					recurseDependencies(dep, dependencies, visited);
				}
			}
		}

		dependencies.push(plugin);

		return dependencies;
	}

	return recurseDependencies(plugin);
}
