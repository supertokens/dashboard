import { useState } from "react";
import { StorageKeys } from "@shared/constants";
import { localStorageHandler } from "@shared/services/storage";
import { getApiUrl, useFetchData } from "@shared/utils";

const useAuthService = () => {
	const fetchData = useFetchData();
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const logout = async () => {
		setIsLoading(true);
		try {
			const response = await fetchData({
				url: getApiUrl("/api/signout"),
				method: "POST",
			});
			const body = await response.json();
			if (body.status === "OK") {
				localStorageHandler.removeItem(StorageKeys.AUTH_KEY);
				localStorageHandler.removeItem(StorageKeys.EMAIL);
				window.location.reload();
			}
		} finally {
			setIsLoading(false);
		}
	};

	const signIn = async ({ email, password }: { email: string; password: string }) => {
		setIsLoading(true);
		try {
			return await fetchData({
				url: getApiUrl("/api/signin"),
				method: "POST",
				config: {
					body: JSON.stringify({
						email,
						password,
					}),
				},
			});
		} finally {
			setIsLoading(false);
		}
	};

	return {
		logout,
		signIn,
		isLoading,
	};
};

export default useAuthService;
