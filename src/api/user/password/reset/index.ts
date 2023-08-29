import { HTTPStatusCodes } from "../../../../constants";
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
			status: "OK" | "PASSWORD_UPDATE_FORBIDDEN";
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
					userId,
					newPassword,
				}),
			},
		});

		if (response.status === HTTPStatusCodes.FORBIDDEN) {
			return {
				status: "PASSWORD_UPDATE_FORBIDDEN",
			};
		}

		return await response.json();
	};

	return { updatePassword };
};

export default usePasswordResetService;
