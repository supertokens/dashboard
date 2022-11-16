import { fetchDataAndRedirectIf401, getApiUrl } from "../../../../utils";

type UpdatePasswordResponse =
	| {
			status: "OK";
	  }
	| {
			status: "INVALID_PASSWORD_ERROR";
			error: string;
	  };

export const updatePassword = async (userId: string, newPassword: string): Promise<UpdatePasswordResponse> => {
	const response = await fetchDataAndRedirectIf401({
		url: getApiUrl("/api/user/password"),
		method: "PUT",
		query: { userId },
		config: {
			body: JSON.stringify({
				userId,
				newPassword,
			}),
		},
	});
	return await response.json();
};
