import { User } from "../../../ui/pages/usersList/types";
import { getApiUrl, useFetchData } from "../../../utils";

interface ICreateUserService {
	createEmailPasswordUser: (
		tenantId: string,
		email: string,
		password: string
	) => Promise<CreateEmailPasswordUserResponse>;
	createPasswordlessUser: (
		tenantId: string,
		email: string | undefined,
		phone: string | undefined
	) => Promise<CreatePasswordlessUserResponse>;
}

type CreateEmailPasswordUserResponse =
	| {
			status: "OK";
			user: User;
			recipeUserId: string;
	  }
	| {
			status: "EMAIL_ALREADY_EXISTS_ERROR" | "FEATURE_NOT_ENABLED_ERROR";
	  };

type CreatePasswordlessUserResponse =
	| {
			status: string;
			createdNewRecipeUser: boolean;
			user: User;
			recipeUserId: string;
	  }
	| {
			status: "FEATURE_NOT_ENABLED_ERROR";
	  };

const useCreateUserService = (): ICreateUserService => {
	const fetchData = useFetchData();

	const createEmailPasswordUser = async (
		email: string,
		password: string,
		tenantId: string | undefined
	): Promise<CreateEmailPasswordUserResponse> => {
		const response = await fetchData({
			url: getApiUrl("/api/user/create/emailpassword", tenantId),
			method: "POST",
			config: {
				body: JSON.stringify({
					email,
					password,
				}),
			},
		});
		return await response.json();
	};

	const createPasswordlessUser = async (
		tenantId: string,
		email: string | undefined,
		phone: string | undefined
	): Promise<CreatePasswordlessUserResponse> => {
		const response = await fetchData({
			url: getApiUrl("/api/user/create/passwordless", tenantId),
			method: "POST",
			config: {
				body: JSON.stringify({
					email,
					phone,
				}),
			},
		});
		return await response.json();
	};

	return { createEmailPasswordUser, createPasswordlessUser };
};

export default useCreateUserService;
