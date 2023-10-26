import "./noRolesFound.scss";

import { ReactComponent as SecuityKeyIcon } from "../../../../assets/secuity-key.svg";

export default function NoRolesFound() {
	return (
		<section className="paper-container">
			<div>
				<SecuityKeyIcon />
				<h1>Currently, you don’t have any Roles</h1>
				<p>Once added, all created user roles will be found here</p>
			</div>
		</section>
	);
}
