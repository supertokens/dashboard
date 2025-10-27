import { Layout } from "@features/layout";
import type { ComponentOverride } from "./componentOverride";
import { Header, Sidebar } from "@features/layout/components";
import {
	Auth,
	SignInContent,
	SignInContentWrapper,
	SignInWithApiKeyContent,
	SignOutBtn,
	SignUpOrResetPasswordContent,
} from "@features/auth";
import AuthWrapper from "@features/auth/components/AuthWrapper";
import RolesListHeader from "@features/roles-and-permissions/components/RolesListHeader";
import RolesListTable from "@features/roles-and-permissions/components/RolesListTable";
import RolesList from "@features/users/components/user-details/roles/RolesList";
import RolesListItem from "@features/roles-and-permissions/components/RolesListItem";
import RolesListFooter from "@features/roles-and-permissions/components/RolesListFooter";
import TenantsList from "@features/tenants/components/TenantsList";
import TenantsListHeader from "@features/tenants/components/TenantsListHeader";
import TenantsListFooter from "@features/tenants/components/TenantsListFooter";
import TenantsListTable from "@features/tenants/components/TenantsListTable";
import TenantsListItem from "@features/tenants/components/TenantsListItem";

type SuperTokensPublicConfig = {
	apiPath: string;
};
export type PluginRouteHandler = {
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
	componentOverrides?: ComponentOverrideMap;
	routeHandlers?:
		| ((
				config: SuperTokensPublicConfig,
				allPlugins: SuperTokensPublicPlugin[]
		  ) => { status: "OK"; routeHandlers: PluginRouteHandler[] } | { status: "ERROR"; message: string })
		| PluginRouteHandler[];

	config?: (config: SuperTokensPublicConfig) => SuperTokensPublicConfig | undefined;
	exports?: Record<string, any>;
};

export type SuperTokensPublicPlugin = Pick<SuperTokensPlugin, "id" | "version" | "exports"> & { initialized: boolean };

export type ComponentOverrideMap = {};
