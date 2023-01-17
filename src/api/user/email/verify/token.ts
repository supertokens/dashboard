import { getApiUrl, useFetchData } from "../../../../utils";

interface IUseVerifyUserTokenService {
	sendUserEmailVerification: (userId: string) => Promise<boolean>;
}

const useVerifyUserTokenService = (): IUseVerifyUserTokenService => {
	const fetchData = useFetchData();

	const sendUserEmailVerification = async (userId: string) => {
		const response = await fetchData({
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

	return { sendUserEmailVerification };
};

export default useVerifyUserTokenService;
