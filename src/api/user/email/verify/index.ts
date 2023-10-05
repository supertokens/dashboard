import { EmailVerificationStatus } from "../../../../ui/pages/usersList/types";
import { getApiUrl, useFetchData } from "../../../../utils";

interface IUseVerifyUserEmailService {
	getUserEmailVerificationStatus: (userId: string) => Promise<EmailVerificationStatus>;
	updateUserEmailVerificationStatus: (
		userId: string,
		isEmailVerified: boolean,
		tenantId: string | undefined
	) => Promise<boolean>;
}

const useVerifyUserEmail = (): IUseVerifyUserEmailService => {
	const fetchData = useFetchData();

	const getUserEmailVerificationStatus = async (userId: string): Promise<EmailVerificationStatus> => {
		const response = await fetchData({
			url: getApiUrl("/api/user/email/verify"),
			method: "GET",
			query: { recipeUserId: userId },
		});

		const body = await response.json();
		return body;
	};

	const updateUserEmailVerificationStatus = async (
		userId: string,
		isEmailVerified: boolean,
		tenantId: string | undefined
	) => {
		const response = await fetchData({
			url: getApiUrl("/api/user/email/verify", tenantId),
			method: "PUT",
			config: {
				body: JSON.stringify({ verified: isEmailVerified, recipeUserId: userId }),
			},
		});
		return response?.ok;
	};

	return {
		getUserEmailVerificationStatus,
		updateUserEmailVerificationStatus,
	};
};

export default useVerifyUserEmail;
