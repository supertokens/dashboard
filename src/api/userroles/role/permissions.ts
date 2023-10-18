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

	const addPermissionsToRole = async (role: string, permissions: string[]): Promise<boolean> => {
		const response = await fetchData({
			url: getApiUrl("/api/userroles/role/permissions"),
			method: "PUT",
			config: {
				body: JSON.stringify({
					role,
					permissions,
				}),
			},
		});

		if (response.ok) {
			return true;
		}

		return false;
	};

	const removePermissionsFromRole = async (
		role: string,
		permissions: string[]
	): Promise<{
		status: "OK" | "UNKNOWN_ROLE_ERROR";
	}> => {
		const response = await fetchData({
			url: getApiUrl("/api/userroles/role/permissions/remove"),
			method: "PUT",
			config: {
				body: JSON.stringify({
					role,
					permissions,
				}),
			},
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
