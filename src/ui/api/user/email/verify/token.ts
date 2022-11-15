import { fetchDataAndRedirectIf401, getApiUrl } from "../../../../../utils";

export const sendUserEmailVerification = async (userId: string) => {
	const response = await fetchDataAndRedirectIf401({
		url: getApiUrl("/api/user/email/verify/token"),
		method: "POST",
		config: {
			body: JSON.stringify({
				userId,
			}),
		},
	});
	return response?.ok;
};
