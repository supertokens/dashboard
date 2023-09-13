import { getApiUrl, useFetchData } from "../../../../utils";

interface IUseVerifyUserTokenService {
	sendUserEmailVerification: (userId: string, tenantId?: string) => Promise<boolean>;
}

const useVerifyUserTokenService = (): IUseVerifyUserTokenService => {
	const fetchData = useFetchData();

	const sendUserEmailVerification = async (userId: string, tenantId?: string) => {
		const response = await fetchData({
			url: getApiUrl("/api/user/email/verify/token", tenantId),
			method: "POST",
			config: {
				body: JSON.stringify({
					recipeUserId: userId,
				}),
			},
		});
		return response?.ok;
	};

	return { sendUserEmailVerification };
};

export default useVerifyUserTokenService;
