import { fetchDataAndRedirectIf401, getApiUrl } from "../../../../../utils";

export const sendUserEmailVerification = async (userId: string) => {
	const response = await fetchDataAndRedirectIf401({
		url: getApiUrl(`/api/user/email/verify/token`),
		method: "POST", 
		query: { userId },
	});
	return response?.ok;
};