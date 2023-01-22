import { useState } from "react";
import { getImageUrl } from "../../../utils";
import InputField from "../inputField/InputField";

const SignInWithApiKeyContent = () => {
	const [apiKeyFieldError, setApiKeyFieldError] = useState("");
	const [apiKey, setApiKey] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		// setIsLoading(true);
		// setServerValidationError("");
		// setUserTriedToSubmit(true);
		// const hasErrors = checkValuesForErrors();
		// if (hasErrors) {
		// 	setIsLoading(false);
		// 	return;
		// }
		// await validateCredentials();
		// setIsLoading(false);
	};

	const handleApiKeyFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setApiKey(e.target.value);
	};

	return (
		<div>
			<h2 className="api-key-form-title text-title">Enter your API Key</h2>
			<p className="text-small text-label">Please enter the API key that you used to connect with your backend</p>
			<form
				className="api-key-form"
				onSubmit={handleSubmit}>
				<InputField
					handleChange={handleApiKeyFieldChange}
					name="apiKey"
					type="password"
					error={apiKeyFieldError}
					value={apiKey}
					placeholder="Your API Key"
				/>

				<button
					className="button"
					type="submit"
					disabled={loading}>
					<span>Continue</span>{" "}
					<img
						src={getImageUrl("right_arrow_icon.svg")}
						alt="Auth Page"
					/>
				</button>
			</form>
		</div>
	);
};

export default SignInWithApiKeyContent;
