import { ImplType } from "@plugins";
import { OverrideableBuilder } from "supertokens-js-override";

export class Implementation implements ImplType<Implementation> {
	static instance: Implementation | undefined;

	static init(config: { override?: (originalImplementation: Implementation) => Implementation }): void {
		if (Implementation.instance) {
			return;
		}

		const implementation = new Implementation();
		const builder = new OverrideableBuilder<ImplType<Implementation>>(implementation);
		if (config.override) {
			builder.override(config.override);
		}
		Implementation.instance = builder.build();
	}

	static getInstanceOrThrow(): Implementation {
		if (!Implementation.instance) {
			throw new Error("Implementation instance not found. Make sure you have initialized the plugin.");
		}

		return Implementation.instance;
	}

	static reset(): void {
		Implementation.instance = undefined;
	}

	constructor() {}

	testMethod = async function (this: Implementation): Promise<boolean> {
		console.log("og testMethod");
		return true;
	};

	// Auth methods
	validateSignInCredentials = async function (
		this: Implementation,
		input: {
			email: string;
			password: string;
			signIn: (params: { email: string; password: string }) => Promise<Response>;
			onSuccess: () => void;
			setServerValidationError: (error: string) => void;
		}
	): Promise<void> {
		const { email, password, signIn, onSuccess, setServerValidationError } = input;
		const response = await signIn({ email, password });
		const body = await response.json();
		if (response.status === 200) {
			switch (body.status) {
				case "OK":
					const { localStorageHandler } = await import("@shared/services/storage");
					const { StorageKeys } = await import("@shared/constants");
					localStorageHandler.setItem(StorageKeys.AUTH_KEY, body.sessionId);
					localStorageHandler.setItem(StorageKeys.EMAIL, email);
					onSuccess();
					break;
				case "USER_LIMIT_REACHED_ERROR":
					setServerValidationError(body.message);
					break;
				case "USER_SUSPENDED_ERROR":
					setServerValidationError(
						"User is currently suspended. Please sign in with another account, or reactivate the SuperTokens core license key."
					);
					break;
				default:
					setServerValidationError("Incorrect email and password combination");
					break;
			}
		} else {
			setServerValidationError("Something went wrong");
		}
	};

	checkSignInValuesForErrors = async function (
		this: Implementation,
		input: {
			email: string;
			password: string;
		}
	): Promise<{ email: string; password: string }> {
		const { email, password } = input;
		const { validateEmail } = await import("@shared/utils/form");
		const errors: { email: string; password: string } = {
			email: "",
			password: "",
		};
		if (!email) errors.email = "Email cannot be empty";
		if (!password) errors.password = "Password cannot be empty";
		if (!validateEmail(email)) errors.email = "Email is invalid";
		return errors;
	};

	validateApiKey = async function (
		this: Implementation,
		input: {
			apiKey: string;
			fetchData: (params: any) => Promise<Response>;
			onSuccess: () => void;
			setApiKeyFieldError: (error: string) => void;
		}
	): Promise<void> {
		const { apiKey, fetchData, onSuccess, setApiKeyFieldError } = input;
		const { getApiUrl } = await import("@shared/utils");
		const { HTTPStatusCodes, StorageKeys } = await import("@shared/constants");
		const { localStorageHandler } = await import("@shared/services/storage");

		const response = await fetchData({
			url: getApiUrl("/api/key/validate"),
			method: "POST",
			config: {
				headers: {
					authorization: `Bearer ${apiKey}`,
				},
			},
			shouldRedirectOnUnauthorised: false,
		});

		const body = await response.json();

		if (response.status === 200 && body.status === "OK") {
			localStorageHandler.setItem(StorageKeys.AUTH_KEY, apiKey);
			onSuccess();
		} else if (response.status === HTTPStatusCodes.UNAUTHORIZED) {
			setApiKeyFieldError("Invalid API Key");
		} else {
			setApiKeyFieldError("Something went wrong");
		}
	};

	// User management methods
	createEmailPasswordUser = async function (
		this: Implementation,
		input: {
			tenantId: string;
			email: string;
			password: string;
			createEmailPasswordUserService: (
				tenantId: string,
				email: string,
				password: string
			) => Promise<any>;
			showErrorToast: (message: string) => void;
			showSuccessToast: (message: string) => void;
			setEmailError: (error: string | undefined) => void;
			setPasswordError: (error: string | undefined) => void;
			invalidateQueries: () => Promise<void>;
			onSuccess?: (userId: string) => void;
		}
	): Promise<void> {
		const {
			tenantId,
			email,
			password,
			createEmailPasswordUserService,
			showErrorToast,
			showSuccessToast,
			setEmailError,
			setPasswordError,
			invalidateQueries,
			onSuccess,
		} = input;

		const { STATUS, MESSAGES } = await import("@features/users/constants/createUser");

		const response = await createEmailPasswordUserService(tenantId, email, password);

		if (response.status === STATUS.EMAIL_ALREADY_EXISTS_ERROR) {
			showErrorToast(MESSAGES.EMAIL_ALREADY_EXISTS);
			return;
		}

		if (response.status === STATUS.EMAIL_VALIDATION_ERROR) {
			setEmailError(response.message);
			return;
		}

		if (response.status === STATUS.PASSWORD_VALIDATION_ERROR) {
			setPasswordError(response.message);
			return;
		}

		if (response.status === STATUS.FEATURE_NOT_ENABLED_ERROR) {
			showErrorToast(MESSAGES.FEATURE_NOT_ENABLED);
			return;
		}

		if (response.status === STATUS.OK) {
			showSuccessToast(MESSAGES.SUCCESS);
			await invalidateQueries();
			onSuccess?.(response.user.id);
		}
	};

	createPasswordlessUser = async function (
		this: Implementation,
		input: {
			tenantId: string;
			payload: { email?: string; phoneNumber?: string };
			authMethod: "EMAIL" | "PHONE" | "EMAIL_OR_PHONE" | undefined;
			emailOrPhone?: string;
			createPasswordlessUserService: (
				tenantId: string,
				payload: { email?: string; phoneNumber?: string }
			) => Promise<any>;
			showErrorToast: (message: string) => void;
			showSuccessToast: (message: string) => void;
			setFormError: (error: string | undefined) => void;
			invalidateQueries: () => Promise<void>;
			onSuccess?: (userId: string) => void;
		}
	): Promise<void> {
		const {
			tenantId,
			payload,
			authMethod,
			emailOrPhone,
			createPasswordlessUserService,
			showErrorToast,
			showSuccessToast,
			setFormError,
			invalidateQueries,
			onSuccess,
		} = input;

		const { STATUS, MESSAGES } = await import("@features/users/constants/createUser");

		const response = await createPasswordlessUserService(tenantId, payload);

		// Handle validation errors
		if (response.status === STATUS.EMAIL_VALIDATION_ERROR || response.status === STATUS.PHONE_VALIDATION_ERROR) {
			if (
				authMethod === "EMAIL_OR_PHONE" &&
				response.status === STATUS.EMAIL_VALIDATION_ERROR &&
				emailOrPhone &&
				!this.isPhoneNumber(emailOrPhone)
			) {
				setFormError(MESSAGES.INVALID_EMAIL_OR_PHONE);
			} else {
				setFormError(response.message);
			}
			return;
		}

		// Handle feature not enabled error
		if (response.status === STATUS.FEATURE_NOT_ENABLED_ERROR) {
			showErrorToast(MESSAGES.FEATURE_NOT_ENABLED);
			return;
		}

		// Handle successful response
		if (response.status === STATUS.OK) {
			if (response.createdNewRecipeUser === false) {
				const errorMessage = this.getPasswordlessExistingUserErrorMessage(authMethod, emailOrPhone);
				showErrorToast(errorMessage);
			} else {
				showSuccessToast(MESSAGES.SUCCESS);
				await invalidateQueries();
				onSuccess?.(response.user.id);
			}
		}
	};

	buildPasswordlessPayload = function (
		this: Implementation,
		input: {
			authMethod: "EMAIL" | "PHONE" | "EMAIL_OR_PHONE" | undefined;
			email: string;
			phoneNumber: string;
			emailOrPhone: string;
			setShowPhoneInput: (show: boolean) => void;
		}
	): { email?: string; phoneNumber?: string } | null {
		const { authMethod, email, phoneNumber, emailOrPhone, setShowPhoneInput } = input;

		const payload: { email?: string; phoneNumber?: string } = {};

		if (authMethod === "EMAIL") {
			payload.email = email;
		} else if (authMethod === "PHONE") {
			payload.phoneNumber = phoneNumber;
		} else if (authMethod === "EMAIL_OR_PHONE") {
			if (this.isPhoneNumber(emailOrPhone)) {
				const normalizedPhone = this.normalizePhoneNumber(emailOrPhone);
				payload.phoneNumber = normalizedPhone;
				setShowPhoneInput(true);
			} else {
				payload.email = emailOrPhone;
			}
		} else {
			return null;
		}

		return payload;
	};

	getPasswordlessExistingUserErrorMessage = function (
		this: Implementation,
		authMethod: "EMAIL" | "PHONE" | "EMAIL_OR_PHONE" | undefined,
		emailOrPhone?: string
	): string {
		const MESSAGES = {
			EMAIL_ALREADY_EXISTS: "User with this email already exists!",
			PHONE_ALREADY_EXISTS: "User with this phone number already exists!",
		};

		if (authMethod === "EMAIL") {
			return MESSAGES.EMAIL_ALREADY_EXISTS;
		} else if (authMethod === "PHONE") {
			return MESSAGES.PHONE_ALREADY_EXISTS;
		} else {
			return emailOrPhone && this.isPhoneNumber(emailOrPhone)
				? MESSAGES.PHONE_ALREADY_EXISTS
				: MESSAGES.EMAIL_ALREADY_EXISTS;
		}
	};

	isPhoneNumber = function (this: Implementation, value: string): boolean {
		const trimmedString = value.replaceAll(/\s/g, "").trim();

		// added this check since parsing a empty string to a number returns 0.
		if (trimmedString.length < 1) {
			return false;
		}

		return !isNaN(Number(trimmedString));
	};

	normalizePhoneNumber = function (this: Implementation, phoneNumber: string): string {
		return phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
	};

	// Metadata processing
	processUserMetadata = async function (
		this: Implementation,
		input: {
			data: any;
		}
	): Promise<string | undefined> {
		const { data } = input;

		if (data === "FEATURE_NOT_ENABLED_ERROR") {
			return "Feature Not Enabled";
		}

		if (data === undefined) {
			return undefined;
		}

		if (typeof data === "string") {
			return data;
		}

		return JSON.stringify(data);
	};

	// User update logic
	buildUserUpdateParameters = async function (
		this: Implementation,
		input: {
			userId: string;
			user: any;
			tenants: any[];
		}
	): Promise<{
		userId: string;
		recipeId: string;
		recipeUserId: string;
		email?: string;
		phone?: string;
		firstName?: string;
		lastName?: string;
		tenantId: string;
	}> {
		const { userId, user, tenants } = input;

		return {
			userId,
			recipeId: user.loginMethods[0]?.recipeId || "emailpassword",
			recipeUserId: user.loginMethods[0]?.recipeUserId || userId,
			email: user.loginMethods[0]?.email,
			phone: user.loginMethods[0]?.phoneNumber,
			firstName: user.firstName,
			lastName: user.lastName,
			tenantId: tenants[0]?.tenantId || "public",
		};
	};
}
