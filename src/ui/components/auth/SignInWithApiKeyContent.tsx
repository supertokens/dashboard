import { useState } from "react";
import { HTTPStatusCodes, StorageKeys } from "../../../constants";
import { localStorageHandler } from "../../../services/storage";
import { getApiUrl, getImageUrl, useFetchData } from "../../../utils";
import InputField from "../inputField/InputField";

interface SignInWithApiKeyContentProps {
	onSuccess: () => void;
}

const SignInWithApiKeyContent = (props: SignInWithApiKeyContentProps) => {
	const [apiKeyFieldError, setApiKeyFieldError] = useState("");
	const [apiKey, setApiKey] = useState("");
	const [loading, setIsLoading] = useState<boolean>(false);
	const fetchData = useFetchData();

	const validateKey = async () => {
		setIsLoading(true);
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
			props.onSuccess();
		} else if (response.status === HTTPStatusCodes.UNAUTHORIZED) {
			setApiKeyFieldError("Invalid API Key");
		} else {
			setApiKeyFieldError("Something went wrong");
		}

		setIsLoading(false);
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setApiKeyFieldError("");

		if (apiKey !== null && apiKey !== undefined && apiKey.length > 0) {
			void validateKey();
		} else {
			setApiKeyFieldError("API Key field cannot be empty");
		}
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
					style={{ marginTop: "1em" }}
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
