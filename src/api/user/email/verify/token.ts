import { getApiUrl, useFetchData } from "../../../../utils";

const useVerifyUserTokenService = () => {
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
			shouldRedirect: true,
		});
		return response?.ok;
	};

	return { sendUserEmailVerification };
};

export default useVerifyUserTokenService;
