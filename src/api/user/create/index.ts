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
	  }
	| {
			status: "EMAIL_VALIDATION_ERROR";
			message: string;
	  }
	| {
			status: "PASSWORD_VALIDATION_ERROR";
			message: string;
	  };

type CreatePasswordlessUserResponse =
	| {
			status: "OK";
			createdNewRecipeUser: boolean;
			user: User;
			recipeUserId: string;
	  }
	| {
			status: "FEATURE_NOT_ENABLED_ERROR";
	  }
	| {
			status: "EMAIL_VALIDATION_ERROR";
			message: string;
	  }
	| {
			status: "PHONE_VALIDATION_ERROR";
			message: string;
	  };

const useCreateUserService = (): ICreateUserService => {
	const fetchData = useFetchData();

	const createEmailPasswordUser = async (
		tenantId: string | undefined,
		email: string,
		password: string
	): Promise<CreateEmailPasswordUserResponse> => {
		const response = await fetchData({
			url: getApiUrl("/api/user/emailpassword", tenantId),
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
			url: getApiUrl("/api/user/passwordless", tenantId),
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
