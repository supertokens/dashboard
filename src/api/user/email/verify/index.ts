import { EmailVerificationStatus } from "../../../../ui/pages/usersList/types";
import { fetchDataAndRedirectIf401, getApiUrl } from "../../../../utils";

export const getUserEmailVerificationStatus = async (userId: string): Promise<EmailVerificationStatus> => {
	const response = await fetchDataAndRedirectIf401({
		url: getApiUrl("/api/user/email/verify"),
		method: "GET",
		query: { userId },
	});

	const body = await response.json();
	return body;
};

export const updateUserEmailVerificationStatus = async (userId: string, isEmailVerified: boolean) => {
	const response = await fetchDataAndRedirectIf401({
		url: getApiUrl("/api/user/email/verify"),
		method: "PUT",
		config: {
			body: JSON.stringify({ verified: isEmailVerified, userId }),
		},
	});
	return response?.ok;
};
