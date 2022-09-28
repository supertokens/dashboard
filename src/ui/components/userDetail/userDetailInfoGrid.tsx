import { FC, ReactNode, useCallback, useEffect, useState } from "react";
import { formatLongDate, getImageUrl } from "../../../utils";
import { validateEmail, isNotEmpty, validatePhoneNumber } from "../../../utils/form";
import { UserEmailPassword, UserPasswordLess, UserThirdParty, UserWithRecipeId } from "../../pages/usersList/types";
import CopyText from "../copyText/CopyText";
import InputField from "../inputField/InputField";
import { LayoutPanel } from "../layout/layoutPanel";
import PhoneDisplay from "../phoneNumber/PhoneNumber";
import { PhoneNumberInput } from "../phoneNumber/PhoneNumberInput";
import TooltipContainer from "../tooltip/tooltip";
import { UserDetailChangePasswordPopup } from "./userDetailForm";

type UserDetailInfoGridProps = {
	user: UserWithRecipeId;
	onUpdateCallback: (user: UserWithRecipeId) => void;
};

type UserDetailInfoGridItemProps = {
	label?: ReactNode;
	body?: ReactNode;
	tooltip?: ReactNode;
};

type UserDetailInfoGridHeaderProps = UserDetailInfoGridProps & {
	onSave: () => void;
	onEdit: () => void;
	isSaveDisabled: boolean;
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
	onSave,
	onEdit,
	isEditing,
}: UserDetailInfoGridHeaderProps) => (
	<>
		<div className="title">User Information</div>
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
);

export const UserDetailInfoGrid: FC<UserDetailInfoGridProps> = ({ user, onUpdateCallback }) => {
	const nonApplicableText = "N/A";
	const [userState, setUserState] = useState<UserWithRecipeId>({ ...user});
	const { recipeId } = userState;
	const { firstName, lastName, timeJoined, email } = userState.user;
	const [isEmailVerified, setIsEmailVerified] = useState(true);
	const [isEditing, setIsEditing] = useState(false);

	const onSave = useCallback(() => {
			console.log('onSave', userState)
			onUpdateCallback(userState);
		setIsEditing(false);
	}, [onUpdateCallback, userState]);

	const updateUserDataState = useCallback((updatedUser: Partial<UserWithRecipeId["user"]>) => {
		setUserState((currentState) => {
			return { ...currentState, user: { ...currentState.user, ...updatedUser } } as UserWithRecipeId;
		});
	}, []);

	const toggleEmailVerified = useCallback(() => setIsEmailVerified(!isEmailVerified), [isEmailVerified]);

	useEffect(() => setUserState(user), [user]);

	useEffect(() => console.log('setUserState', user), [user]);

	// validate email if `isEditing=true`
	const emailError = useCallback(() => {
		if (!isEditing) { return; }
		if (isNotEmpty(email)) {
			return !validateEmail(email!) ? "Email address is invalid" : undefined;
		} else if (user.user.email !== undefined) {
			return "Email cannot be empty"
		}
	}, [ email, user.user.email, isEditing ])();

	// validate phone if `isEditing=true`
	const phoneNumber = recipeId === "passwordless" ? userState.user.phoneNumber : undefined;
	const phoneNumberProps = user.recipeId === "passwordless" ? user.user.phoneNumber : undefined;
	const phoneNumberError = useCallback(() => {
		if (!isEditing) { return; }
		console.log(phoneNumber)
		if (isNotEmpty(phoneNumber)) {
			return !validatePhoneNumber(phoneNumber!) ? "Phone number is invalid" : undefined;
		} else if (phoneNumberProps !== undefined) {
			return "Phone number cannot be empty"
		}
	}, [ phoneNumber, phoneNumberProps, isEditing ])();


	const phone = 
		(isEditing ? (
			<PhoneNumberInput
				name="phone number"
				value={phoneNumber}
				error={phoneNumberError}
				isRequired={ 
					// prevent delete phone number if it was a phoneNumber account
					user.recipeId === 'passwordless' && user.user.phoneNumber !== undefined 
				}
				onChange={(phoneNumber) => {
					updateUserDataState({ phoneNumber })
				}}
			/>
		) : phoneNumber !== undefined ? (
			<PhoneDisplay phone={phoneNumber} />
		) : undefined);

	const emailGridContent =
		isEditing && (recipeId === "emailpassword" || recipeId === "passwordless") ? (
			<InputField
				type="email"
				name="email"
				error={emailError}
				value={email}
				handleChange={({ target: { value } }) => updateUserDataState({ email: value })}
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

	const saveDisabled = emailError !== undefined || phoneNumberError !== undefined;

	return (
		<div className="user-detail__info-grid">
			<LayoutPanel
				header={
					<UserDetailInfoGridHeader
						{...{ onSave, isEditing, user, onUpdateCallback }}
						onEdit={() => setIsEditing(true)}
						isSaveDisabled={saveDisabled}
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
								{isEmailVerified ? "Yes" : "No"} {emailVerifiedToggle}
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
