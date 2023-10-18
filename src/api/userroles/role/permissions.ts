import { getApiUrl, useFetchData } from "../../../utils";

export const usePermissionsService = () => {
	const fetchData = useFetchData();

	const getPermissionsForRole = async (): Promise<{
		status: "OK";
		permissions: string[];
	}> => {
		const response = await fetchData({
			url: getApiUrl("/api/userroles/role/permissions"),
			method: "GET",
		});

		if (response.ok) {
			const body = await response.json();
			return body;
		}

		return {
			status: "OK",
			permissions: [],
		};
	};

	const addPermissionsToRole = async (): Promise<boolean> => {
		const response = await fetchData({
			url: getApiUrl("/api/userroles/role/permissions"),
			method: "PUT",
		});

		if (response.ok) {
			return true;
		}

		return false;
	};

	const removePermissionsFromRole = async (): Promise<{
		status: "OK" | "UNKNOWN_ROLE_ERROR";
	}> => {
		const response = await fetchData({
			url: getApiUrl("/api/userroles/role/permissions/remove"),
			method: "DELETE",
		});

		if (response.ok) {
			const body = await response.json();
			return body;
		}

		return {
			status: "OK",
		};
	};

	return {
		getPermissionsForRole,
		addPermissionsToRole,
		removePermissionsFromRole,
	};
};
