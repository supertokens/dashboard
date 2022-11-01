import { fetchDataAndRedirectIf401, getApiUrl } from "../../../utils";

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

		if (body.status === "FEATURE_NOT_ENABLED") {
			return "FEATURE_NOT_ENABLED";
		}

		if (body.status !== "OK") {
			return undefined;
		}

		return body.data;
	}

	return undefined;
};
