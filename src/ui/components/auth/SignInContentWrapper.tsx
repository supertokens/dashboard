import SignIn from "./SignInContent";
import SignInWithApiKeyContent from "./SignInWithApiKeyContent";

interface SignInContentWrapperProps {
	onSuccess: () => void;
	onCreateNewUserClick: () => void;
	onForgotPasswordBtnClick: () => void;
}

const SignInContentWrapper: React.FC<SignInContentWrapperProps> = ({ ...props }: SignInContentWrapperProps) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const authMode = (window as any).authMode; // for now, either "api-key" or "username-password"

	if (authMode === "email-password") {
		return <SignIn {...props} />;
	}

	return <SignInWithApiKeyContent onSuccess={props.onSuccess} />;
};

export default SignInContentWrapper;
