import { getAuthMode } from "../../../utils";
import SignIn from "./SignInContent";
import SignInWithApiKeyContent from "./SignInWithApiKeyContent";

interface SignInContentWrapperProps {
	onSuccess: () => void;
	onCreateNewUserClick: () => void;
	onForgotPasswordBtnClick: () => void;
}

const SignInContentWrapper: React.FC<SignInContentWrapperProps> = ({ ...props }: SignInContentWrapperProps) => {
	const authMode = getAuthMode();

	if (authMode === "email-password") {
		return <SignIn {...props} />;
	}

	return <SignInWithApiKeyContent onSuccess={props.onSuccess} />;
};

export default SignInContentWrapper;
