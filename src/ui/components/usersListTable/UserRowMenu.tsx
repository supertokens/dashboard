import { FC } from "react";
import { getImageUrl } from "../../../utils";
import { UserWithRecipeId } from "../../pages/usersList/types";

export type UserRowMenuProps = {
	onSelect?: (user: UserWithRecipeId) => void;
	onDelete?: (user: UserWithRecipeId) => void;
	onChangeEmail?: (user: UserWithRecipeId) => void;
	onChangePassword?: (user: UserWithRecipeId) => void;
	user: UserWithRecipeId;
};

type UserRowMenuItemProps = {
	onClick: () => void;
	text: string;
	imageUrl: string;
	hoverImageUrl?: string;
};

export const UserRowMenuItem: FC<UserRowMenuItemProps> = ({ imageUrl, hoverImageUrl, text, onClick }) => (
	<>
		<button
			className="user-row-select-popup-item button flat"
			onClick={onClick}>
			<img
				className="img-normal"
				src={getImageUrl(imageUrl)}
				alt={text}
			/>
			<img
				className="img-hover"
				src={getImageUrl(hoverImageUrl ?? imageUrl)}
				alt={text}
			/>
			<span>{text}</span>
		</button>
	</>
);

export const UserRowMenu: FC<UserRowMenuProps> = ({ onDelete, onSelect, onChangePassword, onChangeEmail, user }) => {
	return (
		<>
			<div className="user-row-select-menu">
				<button className="user-row-select-button">
					<img
						src={getImageUrl("chevron-down.svg")}
						alt="Open user detail"
					/>
				</button>
				<div className="user-row-select-popup">
					<div className="panel">
						{onSelect && (
							<UserRowMenuItem
								onClick={() => onSelect(user)}
								text="View Details"
								imageUrl="people.svg"
								hoverImageUrl="people-opened.svg"
							/>
						)}
						{onChangeEmail && (
							<UserRowMenuItem
								onClick={() => onChangeEmail(user)}
								text="Change Email"
								imageUrl="mail.svg"
								hoverImageUrl="mail-opened.svg"
							/>
						)}
						{onChangePassword && (
							<UserRowMenuItem
								onClick={() => onChangePassword(user)}
								text="Change Password"
								imageUrl="lock.svg"
								hoverImageUrl="lock-opened.svg"
							/>
						)}
						{onDelete && (
							<UserRowMenuItem
								onClick={() => onDelete(user)}
								text="Delete user"
								imageUrl="trash.svg"
								hoverImageUrl="trash-opened.svg"
							/>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default UserRowMenu;
