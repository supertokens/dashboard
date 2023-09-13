import { getApiUrl, useFetchData } from "../../../../utils";

interface IUsePasswordResetService {
	updatePassword: (
		userId: string,
		newPassword: string,
		tenantId: string | undefined
	) => Promise<UpdatePasswordResponse>;
}

type UpdatePasswordResponse =
	| {
			status: "OK";
	  }
	| {
			status: "INVALID_PASSWORD_ERROR";
			error: string;
	  };

const usePasswordResetService = (): IUsePasswordResetService => {
	const fetchData = useFetchData();

	const updatePassword = async (
		userId: string,
		newPassword: string,
		tenantId: string | undefined
	): Promise<UpdatePasswordResponse> => {
		const response = await fetchData({
			url: getApiUrl("/api/user/password", tenantId),
			method: "PUT",
			query: { userId },
			config: {
				body: JSON.stringify({
					recipeUserId: userId,
					newPassword,
				}),
			},
		});
		return await response.json();
	};

	return { updatePassword };
};

export default usePasswordResetService;
