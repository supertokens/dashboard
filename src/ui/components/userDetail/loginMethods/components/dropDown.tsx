import { useRef, useState } from "react";
import { getImageUrl, useClickOutside } from "../../../../../utils";
import "./dropdown.scss";

type DropDOwnProps = {
	onEdit: () => void;
	onUnlink: () => void | null;
	onDelete: () => void | null;
	showUnlink: boolean;
};

export const DropDown = ({ onEdit, onUnlink, onDelete, showUnlink }: DropDOwnProps) => {
	const [open, setOpen] = useState(false);
	const [hover, setHover] = useState(false);
	const ref = useRef(null);
	useClickOutside(ref, () => setOpen(false));
	const close = (func: () => void | null) => {
		setOpen(false);
		func();
	};
	return (
		<div
			ref={ref}
			className="dropdown"
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}>
			<div
				className={"trigger" + (open ? " open" : "")}
				onClick={() => setOpen(!open)}>
				{(open || hover) && <img src={getImageUrl("Union-yellow.png")} />}
				{!(open || hover) && <img src={getImageUrl("Union.png")} />}
			</div>
			<div className={"menu" + (open ? " open" : "")}>
				<div onClick={() => close(onEdit)}>
					<img
						src={getImageUrl("edit-login-method.png")}
						alt=""
					/>{" "}
					Edit
				</div>
				{showUnlink && (
					<div onClick={() => close(onUnlink)}>
						<img
							src={getImageUrl("unlink-login-method.png")}
							alt=""
						/>{" "}
						Unlink
					</div>
				)}
				<div onClick={() => close(onDelete)}>
					<img
						src={getImageUrl("delete-login-method.png")}
						alt=""
					/>{" "}
					Delete
				</div>
			</div>
		</div>
	);
};
