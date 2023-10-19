import { Footer } from "../components/footer/footer";
import SideBar from "../components/sidebar";

import "./mainLayout.scss";

type MainLayoutProps = {
	children: React.ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
	return (
		<main className="main-layout-container">
			<SideBar />
			<section className="main-content">{children}</section>
			<Footer
				colorMode="dark"
				horizontalAlignment="center"
				verticalAlignment="center"
			/>
		</main>
	);
}
