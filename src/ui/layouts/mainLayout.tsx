import { Footer } from "../components/footer/footer";
import Header from "../components/header";
import SideBar from "../components/sidebar";

import "./mainLayout.scss";

type MainLayoutProps = {
	children: React.ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
	return (
		<>
			<Header />
			<main className="main-layout-container">
				<SideBar />
				<section className="main-content">{children}</section>
				<Footer
					colorMode="dark"
					horizontalAlignment="center"
					verticalAlignment="center"
				/>
			</main>
		</>
	);
}
