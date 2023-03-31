import { StorageKeys } from "../constants";
import { localStorageHandler } from "../services/storage";
import { getApiUrl, useFetchData } from "../utils";

const useAuthService = () => {
	const fetchData = useFetchData();

	const logout = async () => {
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
	};

	const signIn = async ({ email, password }: { email: string; password: string }) => {
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
	};

	return {
		logout,
		signIn,
	};
};

export default useAuthService;
