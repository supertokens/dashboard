import { localStorageHandler } from "@shared/services/storage";
import { StorageKeys } from "@shared/constants";

export const setSelectedTenantIdToLocalStorage = (tenantId: string) => {
	localStorageHandler.setItem(StorageKeys.TENANT_ID, tenantId);
};

export const getSelectedTenantIdFromLocalStorage = (): string | undefined => {
	return localStorageHandler.getItem(StorageKeys.TENANT_ID);
};
