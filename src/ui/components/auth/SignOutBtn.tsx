import useAuth from "../../../api/auth";
import "./SignOutBtn.scss";
const SignOutBtn = () => {
	const { logout } = useAuth();
	return (
		<button
			id="sign-out-btn"
			onClick={logout}>
			Sign Out
		</button>
	);
};

export default SignOutBtn;
