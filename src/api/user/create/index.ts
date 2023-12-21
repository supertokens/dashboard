import { User } from "../../../ui/pages/usersList/types";
import { getApiUrl, useFetchData } from "../../../utils";

export type CreatePasswordlessUserPayload = {
	email?: string;
	phoneNumber?: string;
};

interface ICreateUserService {
	createEmailPasswordUser: (
		tenantId: string,
		email: string,
		password: string
	) => Promise<CreateEmailPasswordUserResponse>;
	createPasswordlessUser: (
		tenantId: string,
		data: CreatePasswordlessUserPayload
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
		tenantId: string | undefined,
		email: string,
		password: string
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
		data: {
			email?: string;
			phoneNumber?: string;
		}
	): Promise<CreatePasswordlessUserResponse> => {
		const response = await fetchData({
			url: getApiUrl("/api/user/create/passwordless", tenantId),
			method: "POST",
			config: {
				body: JSON.stringify({
					...data,
				}),
			},
		});
		return await response.json();
	};

	return { createEmailPasswordUser, createPasswordlessUser };
};

export default useCreateUserService;
