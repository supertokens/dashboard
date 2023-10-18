import { useEffect } from "react";
import useRolesService from "../../../api/userroles/roles";
import { Footer } from "../../components/footer/footer";
import { AppEnvContextProvider } from "../../contexts/AppEnvContext";

import "./index.scss";

export default function UserRolesList() {
	const { getRoles } = useRolesService();

	useEffect(() => {
		void getRoles();
	}, []);
	return (
		<AppEnvContextProvider
			connectionURI={
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(window as any).connectionURI
			}>
			<section className="userroles-container">Hello world!</section>
			<Footer
				colorMode="dark"
				horizontalAlignment="center"
				verticalAlignment="center"
			/>
		</AppEnvContextProvider>
	);
}
