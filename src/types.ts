import { ComponentOverrideMap } from "@plugins";
import { Implementation } from "./implementation";
import { OverrideableBuilder } from "supertokens-js-override";

export type ImplType<O> = { [K in keyof O]: (...args: any[]) => any };

export type AuthMode = "api-key" | "email-password";

export type SuperTokensPluginRouteHandler = {
	path: string; // this is appended to apiBasePath
	handler: () => JSX.Element;
};

export type SuperTokensPlugin = {
	id: string;
	version?: string;
	init?: (config: SuperTokensPublicConfig, allPlugins: SuperTokensPublicPlugin[], sdkVersion: string) => void;
	dependencies?: (
		config: SuperTokensPublicConfig,
		pluginsAbove: SuperTokensPublicPlugin[],
		dashboardVersion: string
	) => { status: "OK"; pluginsToAdd?: SuperTokensPlugin[] } | { status: "ERROR"; message: string };
	overrides?: {
		functions?: (
			originalImplementation: Implementation,
			builder: OverrideableBuilder<ImplType<Implementation>>
		) => Implementation;
		components?: (originalComponentOverrides: ComponentOverrideMap) => ComponentOverrideMap;
		config?: (config: SuperTokensPublicConfig) => SuperTokensPublicConfig;
	};
	routeHandlers?:
		| ((
				config: SuperTokensPublicConfig,
				allPlugins: SuperTokensPublicPlugin[]
		  ) => { status: "OK"; routeHandlers: SuperTokensPluginRouteHandler[] } | { status: "ERROR"; message: string })
		| SuperTokensPluginRouteHandler[];
	exports?: Record<string, any>;
};

export type SuperTokensPublicPlugin = Pick<SuperTokensPlugin, "id" | "version" | "exports"> & { initialized: boolean };

export type AppInfoUserInput = {
	/*
	 * The API that connects with the application.
	 */
	apiDomain: string;

	/*
	 * The base path for SuperTokens middleware in the API.
	 * Default to `/auth`
	 */
	apiBasePath?: string;

	/*
	 * The base path for SuperTokens middleware in the front end application.
	 * Default to `/auth`
	 */
	dashboardBasePath?: string;

	/*
	 * The base path for static files.
	 * Default to `/static`
	 */
	staticBasePath?: string;

	/*
	 * The connection URI for the core.
	 */
	connectionURI: string;
};

export type NormalizedAppInfo = Required<AppInfoUserInput>;

export type SuperTokensConfig = {
	appInfo: AppInfoUserInput;

	isSearchEnabled?: boolean;
	authMode?: AuthMode;

	plugins: SuperTokensPlugin[];
	override?: {
		components?: (originalComponentOverrides: ComponentOverrideMap) => ComponentOverrideMap;
		functions?: (
			originalImplementation: Implementation,
			builder: OverrideableBuilder<ImplType<Implementation>>
		) => Implementation;
	};
};

export type NormalizedSuperTokensConfig = SuperTokensConfig & {
	appInfo: NormalizedAppInfo;
	authMode: AuthMode;
	isSearchEnabled: boolean;
};

export type SuperTokensPublicConfig = Pick<NormalizedSuperTokensConfig, "appInfo" | "isSearchEnabled" | "authMode">;
