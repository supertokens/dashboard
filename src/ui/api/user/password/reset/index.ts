import { fetchDataAndRedirectIf401, getApiUrl } from "../../../../../utils";

export const updatePassword = async (userId: string, newPassword: string) => {
	const response = await fetchDataAndRedirectIf401({
		url: getApiUrl("/api/user/password"),
		method: "PUT",
		query: { userId },
		config: {
			body: JSON.stringify({
				userId,
				newPassword,
			}),
		},
	});
	return response?.ok;
};
