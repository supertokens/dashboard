import { FC, ReactNode, useCallback, useEffect, useState } from "react";
import { formatLongDate, getImageUrl } from "../../../utils";
import { UserThirdParty, UserWithRecipeId } from "../../pages/usersList/types";
import CopyText from "../copyText/CopyText";
import InputField from "../inputField/InputField";
import { LayoutPanel } from "../layout/layoutPanel";
import PhoneDisplay from "../phoneNumber/PhoneNumber";
import TooltipContainer from "../tooltip/tooltip";
import { UserDetailChangePasswordPopup } from "./userDetailForm";

type UserDetailInfoGridProps = {
	user: UserWithRecipeId;
	onUpdateCallback?: (user: UserWithRecipeId) => void;
};

type UserDetailInfoGridItemProps = {
	label?: ReactNode;
	body?: ReactNode;
	tooltip?: ReactNode;
};

type UserDetailInfoGridHeaderProps = UserDetailInfoGridProps & {
	onSave: () => void;
	onEdit: () => void;
	isEditing: boolean;
};

const NameTooltip: FC<{ fieldName: string }> = ({ fieldName }) => (
	<>
		<p className="center">
			To change this information, please add / change <span className="block-snippet-small">{fieldName}</span> key
			in the user metadata section below.
		</p>
		<p className="center">
			Eg: <span className="block-snippet-small">“{fieldName}”:“Jane”</span>
		</p>
	</>
);

export const UserDetailProviderBox: FC<{ user: UserThirdParty }> = ({ user }) => {
	const { userId, id } = user.thirdParty;
	const useLogoIcon = ["apple", "github", "google", "facebook"].includes(id.toLowerCase());

	return (
		<div className={`user-detail__provider-box block-snippet ${id.toLowerCase()}`}>
			<span>
				{
					// display logo for recognized provider, otherwise displays providerId as text
					useLogoIcon ? (
						<img
							src={getImageUrl(`provider-${id}.svg`)}
							alt={id}
						/>
					) : (
						id
					)
				}
			</span>
			<span>|</span>
			<span className="user-detail__provider-box__user-id">
				<CopyText>{userId}</CopyText>
			</span>
		</div>
	);
};

export const UserDetailInfoGridItem: FC<UserDetailInfoGridItemProps> = ({ label, body, tooltip }) => {
	const tooltipElement =
		tooltip !== undefined ? (
			<TooltipContainer tooltip={tooltip}>
				<span className="user-detail__info-grid__item__guide">
					<img
						src={getImageUrl("help-icon.png")}
						alt={`${label} guideline`}
					/>
				</span>
			</TooltipContainer>
		) : null;

	return (
		<div className="user-detail__info-grid__item">
			<div className="user-detail__info-grid__item__label">
				{label}
				{tooltipElement}
			</div>
			<div
				className="user-detail__info-grid__item__body"
				title={typeof body === "string" ? body : undefined}>
				{body ?? "-"}
			</div>
		</div>
	);
};

const UserDetailInfoGridHeader: FC<UserDetailInfoGridHeaderProps> = ({
	onUpdateCallback,
	onSave,
	onEdit,
	isEditing,
}: UserDetailInfoGridHeaderProps) => (
	<>
		<div className="title">User Information</div>
		{onUpdateCallback !== undefined && (
			<>
				{isEditing ? (
					<button
						className="button link outline small"
						onClick={onSave}>
						Save
					</button>
				) : (
					<button
						className="button flat link small"
						onClick={onEdit}>
						Edit Info
					</button>
				)}
			</>
		)}
	</>
);
export const UserDetailInfoGrid: FC<UserDetailInfoGridProps> = ({ user, onUpdateCallback }) => {
	const nonApplicableText = "N/A";
	const [userState, setUserState] = useState<UserWithRecipeId>(user);
	const { recipeId } = userState;
	const { firstName, lastName, timeJoined, email } = userState.user;
	const [isEmailVerified, setIsEmailVerified] = useState(true);
	const [isEditing, setIsEditing] = useState(false);

	const onSave = useCallback(() => {
		if (onUpdateCallback) {
			onUpdateCallback(userState);
		}
		setIsEditing(false);
	}, [onUpdateCallback, userState]);

	const updateUserData = useCallback((userData: Partial<UserWithRecipeId["user"]>) => {
		setUserState((currentState) => {
			currentState.user = { ...currentState.user, ...userData };
			return currentState;
		});
	}, []);

	const toggleEmailVerified = useCallback(() => setIsEmailVerified(!isEmailVerified), [isEmailVerified]);

	useEffect(() => setUserState(user), [user]);

	const phone =
		recipeId === "passwordless" &&
		userState.user.phoneNumber !== undefined &&
		userState.user.phoneNumber.trim().length > 0 ? (
			<PhoneDisplay phone={userState.user.phoneNumber} />
		) : undefined;

	const emailGridContent =
		isEditing && (recipeId === "emailpassword" || recipeId === "passwordless") ? (
			<InputField
				type="email"
				name="email"
				value={email}
				handleChange={({ target: { value } }) => updateUserData({ email: value })}
			/>
		) : (
			email
		);

	const emailVerifiedToggle = email !== undefined && isEditing && (
		<button
			className="flat link email-verified-toggle"
			onClick={toggleEmailVerified}>
			Set as {isEmailVerified ? "unverified" : "verified"}
		</button>
	);

	return (
		<div className="user-detail__info-grid">
			<LayoutPanel
				header={
					<UserDetailInfoGridHeader
						{...{ onSave, isEditing, user, onUpdateCallback }}
						onEdit={() => setIsEditing(true)}
					/>
				}>
				<div className="user-detail__info-grid__grid">
					<UserDetailInfoGridItem
						label={"First Name:"}
						body={firstName}
						tooltip={<NameTooltip fieldName="firstName" />}
					/>
					<UserDetailInfoGridItem
						label={"Last Name:"}
						body={lastName}
						tooltip={<NameTooltip fieldName="lastName" />}
					/>
					<UserDetailInfoGridItem
						label={"Signed up on:"}
						body={timeJoined && formatLongDate(timeJoined)}
					/>
					<UserDetailInfoGridItem
						label={"Email ID:"}
						body={emailGridContent}
					/>
					<UserDetailInfoGridItem
						label={"Is Email Verified:"}
						body={
							<>
								{" "}
								{isEmailVerified ? "Yes" : "No"} {emailVerifiedToggle}{" "}
							</>
						}
					/>
					<UserDetailInfoGridItem
						label={"Phone Number:"}
						body={recipeId === "passwordless" ? phone : nonApplicableText}
					/>
					<UserDetailInfoGridItem
						label={"Password:"}
						body={
							recipeId === "emailpassword" ? (
								<UserDetailChangePasswordPopup onPasswordChange={() => {}}>
									<button className="flat link">Change Password</button>
								</UserDetailChangePasswordPopup>
							) : (
								nonApplicableText
							)
						}
					/>
					<UserDetailInfoGridItem
						label={"Provider | Provider user id:"}
						body={
							recipeId === "thirdparty" ? (
								<UserDetailProviderBox user={userState.user} />
							) : (
								nonApplicableText
							)
						}
					/>
				</div>
			</LayoutPanel>
		</div>
	);
};

export default UserDetailInfoGrid;
