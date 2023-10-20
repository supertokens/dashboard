import useAuthService from "../../../api";
import Button from "../button";
import "./SignOutBtn.scss";
const SignOutBtn = () => {
	const { logout } = useAuthService();
	return (
		<Button
			color="outline"
			onClick={logout}>
			Sign Out
		</Button>
	);
};

export default SignOutBtn;
