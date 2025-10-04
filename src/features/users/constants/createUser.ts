export const STATUS = {
	OK: "OK",
	EMAIL_VALIDATION_ERROR: "EMAIL_VALIDATION_ERROR",
	PHONE_VALIDATION_ERROR: "PHONE_VALIDATION_ERROR",
	PASSWORD_VALIDATION_ERROR: "PASSWORD_VALIDATION_ERROR",
	EMAIL_ALREADY_EXISTS_ERROR: "EMAIL_ALREADY_EXISTS_ERROR",
	FEATURE_NOT_ENABLED_ERROR: "FEATURE_NOT_ENABLED_ERROR",
} as const;

export const MESSAGES = {
	SUCCESS: "User created successfully!",
	FEATURE_NOT_ENABLED: "Feature not enabled!",
	GENERIC_ERROR: "Something went wrong, please try again!",
	NO_AUTH_METHOD: "No matching auth method found!",
	INVALID_EMAIL_OR_PHONE: "Please enter a valid email or phone number.",
	EMAIL_ALREADY_EXISTS: "User with this email already exists!",
	PHONE_ALREADY_EXISTS: "User with this phone number already exists!",
} as const;
