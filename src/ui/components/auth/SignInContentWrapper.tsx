import SignIn from "./SignInContent";
import SignInWithApiKeyContent from "./SignInWithApiKeyContent";

interface SignInContentWrapperProps {
    contentMode: "sign-in" | "api-sign-in";
    onSuccess: () => void;
    onCreateNewUserClick: () => void;
    onForgotPasswordBtnClick: () => void;
}

const SignInContentWrapper: React.FC<SignInContentWrapperProps> = ({ contentMode, ...props }: SignInContentWrapperProps) => {
    if (contentMode === "sign-in") {
        return <SignIn {...props} />;
    }

    return <SignInWithApiKeyContent />;
};

export default SignInContentWrapper;
