export type UserInfoMap = {
	fromIdTokenPayload?: {
		userId?: string;
		email?: string;
		emailVerified?: string;
	};
	fromUserInfoAPI?: {
		userId?: string;
		email?: string;
		emailVerified?: string;
	};
};

type CommonProviderConfig = {
	thirdPartyId: string;
	name?: string;
	authorizationEndpoint?: string;
	authorizationEndpointQueryParams?: { [key: string]: string | null };
	tokenEndpoint?: string;
	tokenEndpointBodyParams?: { [key: string]: string };
	userInfoEndpoint?: string;
	userInfoEndpointQueryParams?: { [key: string]: string | null };
	userInfoEndpointHeaders?: { [key: string]: string | null };
	jwksURI?: string;
	oidcDiscoveryEndpoint?: string;
	userInfoMap?: UserInfoMap;
	requireEmail?: boolean;
};

export type ProviderClientConfig = {
	clientType?: string;
	clientId: string;
	clientSecret?: string;
	scope?: string[] | null;
	forcePKCE?: boolean;
	additionalConfig?: { [key: string]: unknown };
};

export type ProviderConfig = CommonProviderConfig & {
	clients?: ProviderClientConfig[];
};

export type ProviderConfigResponse = ProviderConfig & {
	isGetAuthorisationRedirectUrlOverridden: boolean;
	isExchangeAuthCodeForOAuthTokensOverridden: boolean;
	isGetUserInfoOverridden: boolean;
};

export type TenantInfo = {
	tenantId: string;
	thirdParty: {
		providers: string[];
	};
	firstFactors: string[];
	requiredSecondaryFactors?: string[] | null;
	coreConfig: CoreConfigOption[];
	userCount: number;
};

export type UpdateTenant = {
	emailPasswordEnabled?: boolean;
	passwordlessEnabled?: boolean;
	thirdPartyEnabled?: boolean;
	firstFactors?: string[] | null;
	requiredSecondaryFactors?: string[] | null;
	coreConfig?: Record<string, unknown>;
};

export type CoreConfigOption = {
	key: string;
	valueType: "string" | "number" | "boolean";
	value: string | number | boolean | null;
	description: string;
	isSaaSProtected: boolean;
	isDifferentAcrossTenants: boolean;
	isModifyableOnlyViaConfigYaml: boolean;
	possibleValues?: string[];
	isNullable: boolean;
	defaultValue: string | number | boolean | null;
	isPluginProperty: boolean;
};

export type TenantDashboardView =
	| {
			view: "tenant-detail";
	  }
	| {
			view: "list-third-party-providers";
	  }
	| {
			view: "add-or-edit-third-party-provider";
			thirdPartyId?: string;
			isAddingNewProvider: boolean;
	  };

export type ProviderCustomField = {
	label: string;
	id: string;
	tooltip: string;
	type: "text" | "password";
	required: boolean;
};

export type BuiltInProvidersCustomFields = {
	[key: string]: {
		additionalConfigFields?: ProviderCustomField[];
		defaultScopes?: string[];
	};
};
