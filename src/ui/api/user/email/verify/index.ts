import { fetchDataAndRedirectIf401, getApiUrl } from "../../../../../utils";
import { EmailVerificationStatus } from "../../../../pages/usersList/types";

export const getUserEmailVerificationStatus = async (userId: string) => {
	const response = await fetchDataAndRedirectIf401({
		url: getApiUrl("/api/user/email/verify"),
		method: "GET",
		query: { userId },
	});

	return (
		response?.ok ? await response?.json() : { status: "FEATURE_NOT_ENABLED", isVerified: false }
	) as EmailVerificationStatus;
};

export const updateUserEmailVerificationStatus = async (userId: string, isEmailVerified: boolean) => {
	const response = await fetchDataAndRedirectIf401({
		url: getApiUrl("/api/user/email/verify"),
		method: "PUT",
		query: { userId },
		config: {
			body: JSON.stringify({ isVerified: isEmailVerified }),
		},
	});
	return response?.ok;
};
