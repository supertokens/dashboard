import React, { useState } from "react";
import { UNAUTHORISED_STATUS } from "../../../constants";
import { fetchData, getApiUrl, getImageUrl } from "../../../utils";
import InputField from "../inputField/InputField";

interface SignInContentProps {
	onSuccess: () => void;
	onForgotPasswordBtnClick: () => void;
}

const SignInContent: React.FC<SignInContentProps> = ({ onSuccess, onForgotPasswordBtnClick }): JSX.Element => {
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [emailError, setEmailError] = useState("");
	const [passwordError, setPasswordError] = useState("");

	const validateKey = async () => {
		setIsLoading(true);
		const response = await fetchData({
			url: getApiUrl("/api/key/validate"),
			method: "POST",
			config: {
				headers: {
					// authorization: `Bearer ${apiKey}`,
				},
			},
		});

		const body = await response.json();

		if (response.status === 200 && body.status === "OK") {
			// localStorageHandler.setItem(StorageKeys.API_KEY, apiKey);
			onSuccess();
		} else if (response.status === UNAUTHORISED_STATUS) {
			// setApiKeyFieldError("Invalid API Key");
		} else {
			// setApiKeyFieldError("Something went wrong");
		}

		setIsLoading(false);
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		// setApiKeyFieldError("");

		// if (apiKey !== null && apiKey !== undefined && apiKey.length > 0) {
		// 	void validateKey();
		// } else {
		// 	setApiKeyFieldError("API Key field cannot be empty");
		// }
	};

	const handleEmailFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value);
	};

	const handlePasswordFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value);
	};

	return (
		<div>
			<h2 className="api-key-form-title text-title">Sign In</h2>
			<p className="text-small text-label">
				More members required? <span className="add-new-user link">Add a new user</span>
			</p>

			<hr />

			<form
				className="api-key-form"
				onSubmit={handleSubmit}>
				<label>Email</label>
				<InputField
					handleChange={handleEmailFieldChange}
					name="email"
					type="email"
					error={emailError}
					value={email}
					placeholder=""
				/>

				<label>Password</label>
				<InputField
					handleChange={handlePasswordFieldChange}
					name="password"
					type="password"
					error={passwordError}
					value={password}
					placeholder=""
				/>

				<div className="cta-container">
					<button
						className="button"
						type="submit"
						disabled={isLoading}>
						<span>Sign In</span>{" "}
						<img
							src={getImageUrl("right_arrow_icon.svg")}
							alt="Auth Page"
						/>
					</button>

					<button
						onClick={onForgotPasswordBtnClick}
						className="flat secondary-cta-btn  forgot-btn bold-400"
						role="button">
						Forgot Password?
					</button>
				</div>
			</form>
		</div>
	);
};

export default SignInContent;
