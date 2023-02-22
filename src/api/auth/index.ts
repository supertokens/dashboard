import { StorageKeys } from "../../constants";
import { localStorageHandler } from "../../services/storage";
import { getApiUrl, useFetchData } from "../../utils";

const useAuth = () => {
	const fetchData = useFetchData();

	const logout = async () => {
		const response = await fetchData({
			url: getApiUrl("/api/signout"),
			method: "POST",
		});
		const body = await response.json();
		if (body.status === "OK") {
			localStorageHandler.removeItem(StorageKeys.AUTH_KEY);
			window.location.reload();
		}
	};

	return {
		logout,
	};
};

export default useAuth;
