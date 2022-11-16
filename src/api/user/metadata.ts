import { fetchDataAndRedirectIf401, getApiUrl } from "../../utils";

export const getUserMetaData = async (userId: string): Promise<string | any> => {
	const response = await fetchDataAndRedirectIf401({
		url: getApiUrl("/api/user/metadata"),
		method: "GET",
		query: {
			userId,
		},
	});

	if (response.ok) {
		const body = await response.json();

		if (body.status === "FEATURE_NOT_ENABLED_ERROR") {
			return "FEATURE_NOT_ENABLED_ERROR";
		}

		if (body.status !== "OK") {
			return undefined;
		}

		return body.data;
	}

	return undefined;
};

export const updateUserMetaData = async (userId: string, data: string) => {
	data = data.replaceAll("\n", "");
	const response = await fetchDataAndRedirectIf401({
		url: getApiUrl("/api/user/metadata"),
		method: "PUT",
		config: {
			body: JSON.stringify({
				userId,
				data,
			}),
		},
	});

	if (response.status === 200) {
		return await response.json();
	}

	if (response.status === 400) {
		throw new Error("Invalid meta data");
	}

	throw new Error("Something went wrong");
};
