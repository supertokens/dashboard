import { fetchDataAndRedirectIf401, getApiUrl } from "../../../utils";

export const deleteUser = async (userId: string): Promise<{ status: "OK" } | undefined> => {
	const response = await fetchDataAndRedirectIf401({
		url: getApiUrl("/api/user"),
		method: "DELETE",
		query: {
			userId,
		},
	});

	if (response.ok) {
		const body = await response.json();

		if (body.status !== "OK") {
			return undefined;
		}

		return body;
	}

	return undefined;
};
