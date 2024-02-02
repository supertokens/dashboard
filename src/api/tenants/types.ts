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
	scope?: string[];
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
	coreConfig: Record<string, unknown>;
	userCount: number;
};
