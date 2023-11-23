import "./noRolesFound.scss";

import { ReactComponent as SecuityKeyIcon } from "../../../../assets/roles-and-permissions.svg";

export default function NoRolesFound() {
	return (
		<section className="paper-container">
			<div>
				<SecuityKeyIcon className="icon" />
				<h1>Currently, you don’t have any Roles</h1>
				<p>Once added, all created user roles will be found here</p>
			</div>
		</section>
	);
}
