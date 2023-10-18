import { getApiUrl, useFetchData } from "../../../utils";

export const useUserRolesService = () => {
	const fetchData = useFetchData();

	const addRoleToUser = async (): Promise<
		| {
				status: "OK";
		  }
		| {
				status: "UNKNOWN_ROLE_ERROR";
		  }
		| {
				status: "ROLE_ALREADY_ASSIGNED";
		  }
	> => {
		const response = await fetchData({
			url: getApiUrl("/api/userroles/roles"),
			method: "PUT",
		});

		if (response.ok) {
			const body = await response.json();
			return body;
		}

		return {
			status: "OK",
		};
	};

	const getRolesForUser = async (): Promise<
		| {
				status: "OK";
				roles: string[];
		  }
		| {
				status: "UNKNOWN_ROLE_ERROR" | "FEATURE_NOT_ENABLED_ERROR";
		  }
	> => {
		const response = await fetchData({
			url: getApiUrl("/api/userroles/roles"),
			method: "GET",
		});

		if (response.ok) {
			const body = await response.json();
			return body;
		}

		return {
			status: "OK",
			roles: [],
		};
	};

	const removeUserRole = async (): Promise<
		| {
				status: "OK";
		  }
		| {
				status: "UNKNOWN_ROLE_ERROR";
		  }
	> => {
		const response = await fetchData({
			url: getApiUrl("/api/userroles/roles"),
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
		addRoleToUser,
		getRolesForUser,
		removeUserRole,
	};
};
