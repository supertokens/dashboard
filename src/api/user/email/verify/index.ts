import { EmailVerificationStatus } from "../../../../ui/pages/usersList/types";
import { getApiUrl, useFetchData } from "../../../../utils";

const useVerifyUserEmail = () => {
	const fetchData = useFetchData();

	const getUserEmailVerificationStatus = async (userId: string): Promise<EmailVerificationStatus> => {
		const response = await fetchData({
			url: getApiUrl("/api/user/email/verify"),
			method: "GET",
			query: { userId },
		});

		const body = await response.json();
		return body;
	};

	const updateUserEmailVerificationStatus = async (userId: string, isEmailVerified: boolean) => {
		const response = await fetchData({
			url: getApiUrl("/api/user/email/verify"),
			method: "PUT",
			config: {
				body: JSON.stringify({ verified: isEmailVerified, userId }),
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
