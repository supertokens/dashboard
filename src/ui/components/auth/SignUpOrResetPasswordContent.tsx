import { getImageUrl } from "../../../utils";
import { ContentMode } from "./types";

interface ISignUpOrResetPasswordContentProps {
	contentMode: Exclude<ContentMode, "sign-in">;
	onBack: () => void;
}

const SignUpOrResetPasswordContent: React.FC<ISignUpOrResetPasswordContentProps> = ({
	contentMode,
	onBack,
}: ISignUpOrResetPasswordContentProps): JSX.Element => {
	const getTextContent = () => {
		switch (contentMode) {
			case "sign-up":
				return {
					title: "Sign Up",
					subtitle: "Insert the below command in your backend configuration to create a new user",
				};
			case "forgot-password":
				return {
					title: "Reset your password",
					subtitle: "Run the below command in your terminal",
				};
			default:
				throw Error("No content found for the prop!");
		}
	};

	const getBottomCTAContent = () => {
		switch (contentMode) {
			case "sign-up":
				break;
			case "forgot-password":
				break;
			default:
				break;
		}
	};

	const { title, subtitle } = getTextContent();

	const command =
		"https://1ac25a511cec847d6570cjdf1ac25a511cec847d6570cb1ac25a511cec847d6570cb1ac25a511cec847d6570cb1ac25a511cec847d6570cb1ac25a511cec847";

	const copyClickHandler = async () => {
		try {
			await navigator.clipboard.writeText(command);
		} catch (error) {
			throw Error("failed to copy the command");
		}
	};

	return (
		<section>
			<h2 className="api-key-form-title text-title">{title}</h2>
			<p className="text-small text-label">{subtitle}</p>
			<div className="command-container">
				<code className="command bold-400">{command}</code>
				<div className="clipboard-btn-container">
					<img
						onClick={copyClickHandler}
						role={"button"}
						className="clipboard-icon"
						alt="Copy to clipboard"
						src={getImageUrl("copy.svg")}
					/>
				</div>
			</div>
			<div className="cta-container">
				<div />

				<span>Account exists ? Sign In</span>
				<button
					className="flat secondary-cta-btn bold-400"
					onClick={onBack}>
					{" "}
					<img
						alt="Go back"
						src={getImageUrl("chevron-left.svg")}
					/>{" "}
					Back
				</button>
			</div>
		</section>
	);
};

export default SignUpOrResetPasswordContent;
