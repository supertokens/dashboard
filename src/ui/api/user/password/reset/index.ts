import { fetchDataAndRedirectIf401, getApiUrl } from "../../../../../utils";

export const updatePassword = async (userId: string, newPassword: string) => {
	const body = {
		method: "token",
		formFields: [
			{
				id: "password",
				value: newPassword,
			},
		],
	};
	const response = await fetchDataAndRedirectIf401({
		url: getApiUrl("/api/user/email/password/reset"),
		method: "POST",
		query: { userId },
		config: {
			body: JSON.stringify(body),
		},
	});
	return response?.ok;
};
