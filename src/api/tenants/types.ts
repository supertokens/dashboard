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

export type TenantInfo = {
	tenantId: string;
	emailPassword: {
		enabled: boolean;
	};
	thirdParty: {
		enabled: boolean;
		providers: ProviderConfig[];
	};
	passwordless: {
		enabled: boolean;
	};
	firstFactors?: Array<string>;
	requiredSecondaryFactors?: Array<string>;
	coreConfig: Record<string, unknown>;
	userCount: number;
};

export type UpdateTenant = {
	emailPasswordEnabled?: boolean;
	passwordlessEnabled?: boolean;
	thirdPartyEnabled?: boolean;
	firstFactors?: string[];
	requiredSecondaryFactors?: string[];
	coreConfig?: Record<string, unknown>;
};

export type CoreConfigOptions = Array<
	| {
			name: string;
			description: string;
			isDifferentAcrossTenants: boolean;
			type: "string" | "number" | "boolean";
	  }
	| {
			name: string;
			description: string;
			isDifferentAcrossTenants: boolean;
			type: "enum";
			options: string[];
	  }
>;

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
		additionalConfigFields?: Array<ProviderCustomField>;
		defaultScopes?: Array<string>;
	};
};
