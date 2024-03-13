import { ProviderConfig } from "../../../../../api/tenants/types";

export type ProviderInfoProps = {
	providerId?: string;
	isAddingNewProvider: boolean;
	handleGoBack: (shouldGoBackToDetailPage?: boolean) => void;
	providerConfig?: ProviderConfig;
	handlePostSaveProviders: (action: "add-or-update" | "delete", providerId: string) => Promise<void>;
};
