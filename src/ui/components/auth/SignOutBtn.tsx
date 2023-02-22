import useAuthService from "../../../api";
import "./SignOutBtn.scss";
const SignOutBtn = () => {
	const { logout } = useAuthService();
	return (
		<button
			id="sign-out-btn"
			onClick={logout}>
			Sign Out
		</button>
	);
};

export default SignOutBtn;
