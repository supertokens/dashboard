import {
	SuperTokensConfig,
	SuperTokensPlugin,
	SuperTokensPublicConfig,
	SuperTokensPublicPlugin,
	AppInfoUserInput,
	NormalizedAppInfo,
	NormalizedSuperTokensConfig,
} from "./types";

const DEFAULT_IS_SEARCH_ENABLED = true;
const DEFAULT_AUTH_MODE = "email-password";
const DEFAULT_STATIC_BASE_PATH = "/static";
const DEFAULT_DASHBOARD_BASE_PATH = "/dashboard/auth";
const DEFAULT_API_BASE_PATH = "/auth";
const DEFAULT_API_DOMAIN = window.location.origin;

export function getNormalizedAppInfo(appInfo: AppInfoUserInput): NormalizedAppInfo {
	return {
		connectionURI: appInfo.connectionURI,
		apiDomain: appInfo.apiDomain || DEFAULT_API_DOMAIN,
		apiBasePath: appInfo.apiBasePath || DEFAULT_API_BASE_PATH,
		staticBasePath: appInfo.staticBasePath || DEFAULT_STATIC_BASE_PATH,
		dashboardBasePath: appInfo.dashboardBasePath || DEFAULT_DASHBOARD_BASE_PATH,
	};
}

export function getNormalizedSuperTokensConfig(config: SuperTokensConfig): NormalizedSuperTokensConfig {
	return {
		...config,
		appInfo: getNormalizedAppInfo(config.appInfo),
		isSearchEnabled: config.isSearchEnabled || DEFAULT_IS_SEARCH_ENABLED,
		plugins: config.plugins ?? [],
		authMode: config.authMode || DEFAULT_AUTH_MODE,
	};
}

export function getPublicPlugin(plugin: SuperTokensPlugin): SuperTokensPublicPlugin {
	return {
		id: plugin.id,
		initialized: plugin.init ? false : true, // since the init method is optional, we default to true
		version: plugin.version,
		exports: plugin.exports,
	};
}

export function getPublicConfig(config: SuperTokensPublicConfig): SuperTokensPublicConfig {
	return {
		appInfo: config.appInfo,
		isSearchEnabled: config.isSearchEnabled,
		authMode: config.authMode,
	};
}
