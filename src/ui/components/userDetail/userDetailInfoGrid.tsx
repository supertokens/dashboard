import { FC, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { formatLongDate, getImageUrl } from "../../../utils";
import { validateEmail, isNotEmpty, validatePhoneNumber } from "../../../utils/form";
import { PopupContentContext } from "../../contexts/PopupContentContext";
import {
	EmailVerificationStatus,
	FEATURE_NOT_ENABLED_TEXT,
	User,
	UserProps,
	UserRecipeType,
	UserThirdParty,
	UserWithRecipeId,
} from "../../pages/usersList/types";
import CopyText from "../copyText/CopyText";
import InputField from "../inputField/InputField";
import { LayoutPanel } from "../layout/layoutPanel";
import PhoneDisplay from "../phoneNumber/PhoneNumber";
import { PhoneNumberInput } from "../phoneNumber/PhoneNumberInput";
import TooltipContainer from "../tooltip/tooltip";
import { UserDetailProps } from "./userDetail";
import { getUserChangePasswordPopupProps } from "./userDetailForm";

type UserDetailInfoGridProps = Pick<
	UserDetailProps,
	| "user"
	| "onUpdateCallback"
	| "onSendEmailVerificationCallback"
	| "onUpdateEmailVerificationStatusCallback"
	| "emailVerification"
	| "onChangePasswordCallback"
>;

type UserDetailInfoGridItemProps = {
	label?: ReactNode;
	body?: ReactNode;
	tooltip?: ReactNode;
};

type UserDetailInfoGridHeaderProps = UserProps & {
	onSave: () => void;
	onEdit: () => void;
	onCancel: () => void;
	isSaveDisabled: boolean;
	isEditing: boolean;
};

const NON_APPLICABLE_TEXT = "N/A";

export const isEmailVerificationApplicable = (recipeId: UserRecipeType) => {
	return recipeId === "emailpassword" || recipeId === "thirdparty";
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
	onCancel,
	isEditing,
	isSaveDisabled,
}: UserDetailInfoGridHeaderProps) => (
	<>
		<div className="title">User Information</div>
		{isEditing ? (
			<div className="actions">
				<button
					className="button outline small"
					onClick={onCancel}>
					Cancel
				</button>
				<button
					className="button link outline small"
					onClick={onSave}
					disabled={isSaveDisabled}>
					Save
				</button>
			</div>
		) : (
			<button
				className="button flat link small"
				onClick={onEdit}>
				Edit Info
			</button>
		)}
	</>
);

type EmailVerifiedFieldProps = UserProps & {
	isEditing: boolean;
	emailVerification: EmailVerificationStatus | undefined;
	setVerificationStatus: (isVerified: boolean) => void;
	sendVerification: () => void;
};

export const EmailVerifiedField: FC<EmailVerifiedFieldProps> = (props: EmailVerifiedFieldProps) => {
	const { user, isEditing, setVerificationStatus, sendVerification, emailVerification } = props;
	const { recipeId } = user;
	const isApplicable = isEmailVerificationApplicable(recipeId);

	if (!isApplicable) {
		return <>{NON_APPLICABLE_TEXT}</>;
	}

	if (emailVerification === undefined) {
		return <>Loading...</>;
	}

	const { isVerified, status } = emailVerification;
	if (status === FEATURE_NOT_ENABLED_TEXT) {
		return <>Feature not enabled</>;
	}

	return (
		<>
			{isVerified ? "Yes" : "No"}
			{isEditing && (
				<button
					className="flat link email-verified-button"
					onClick={() => setVerificationStatus(!isVerified)}>
					Set as {isVerified ? "unverified" : "verified"}
				</button>
			)}
			{!isEditing && !isVerified && (
				<button
					className="flat link email-verified-button"
					onClick={sendVerification}>
					Send verification email
				</button>
			)}
		</>
	);
};

export const UserDetailInfoGrid: FC<UserDetailInfoGridProps> = (props) => {
	const {
		user,
		onUpdateCallback,
		onSendEmailVerificationCallback,
		onUpdateEmailVerificationStatusCallback,
		onChangePasswordCallback,
		emailVerification,
	} = props;
	const [userState, setUserState] = useState<UserWithRecipeId>({ ...user });
	const { showModal } = useContext(PopupContentContext);
	const { recipeId } = userState;
	const { firstName, lastName, timeJoined, email } = userState.user;
	const [isEditing, setIsEditing] = useState(false);

	const onSave = useCallback(() => {
		onUpdateCallback(user.user.id, userState);
		setIsEditing(false);
	}, [onUpdateCallback, userState, user]);

	const updateUserDataState = useCallback((updatedUser: Partial<UserWithRecipeId["user"]>) => {
		setUserState((currentState) => {
			return { ...currentState, user: { ...currentState.user, ...updatedUser } } as UserWithRecipeId;
		});
	}, []);

	useEffect(() => setUserState(user), [user]);

	// validate email if `isEditing=true`
	const emailError = useCallback(() => {
		if (!isEditing) {
			return;
		}
		if (isNotEmpty(email)) {
			return !validateEmail(email!) ? "Email address is invalid" : undefined;
		} else if (user.user.email !== undefined) {
			return "Email cannot be empty";
		}
	}, [email, user.user.email, isEditing])();

	// validate phone if `isEditing=true`
	const phoneNumber = recipeId === "passwordless" ? userState.user.phoneNumber : undefined;
	const phoneNumberProps = user.recipeId === "passwordless" ? user.user.phoneNumber : undefined;
	const phoneNumberError = useCallback(() => {
		if (!isEditing) {
			return;
		}
		if (isNotEmpty(phoneNumber)) {
			return !validatePhoneNumber(phoneNumber!) ? "Phone number is invalid" : undefined;
		} else if (phoneNumberProps !== undefined) {
			return "Phone number cannot be empty";
		}
	}, [phoneNumber, phoneNumberProps, isEditing])();

	const phone = isEditing ? (
		<PhoneNumberInput
			name="phone number"
			value={phoneNumber}
			error={phoneNumberError}
			isRequired={
				// prevent delete phone number if it was a phoneNumber account
				user.recipeId === "passwordless" && user.user.phoneNumber !== undefined
			}
			onChange={(phoneNumber) => {
				updateUserDataState({ phoneNumber });
			}}
		/>
	) : phoneNumber !== undefined ? (
		<PhoneDisplay phone={phoneNumber} />
	) : undefined;

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

	const saveDisabled = emailError !== undefined || phoneNumberError !== undefined;

	const handleCancelSave = useCallback(() => {
		setIsEditing(false);
		setUserState(user);
	}, [user]);

	const handleChangePassword = useCallback(
		(password?: string) => {
			if (password !== undefined) {
				onChangePasswordCallback(user.user.id, password);
			}
		},
		[onChangePasswordCallback, user.user.id]
	);

	const openChangePasswordModal = useCallback(
		() => showModal(getUserChangePasswordPopupProps({ onPasswordChange: handleChangePassword })),
		[showModal, handleChangePassword]
	);

	return (
		<div className="user-detail__info-grid">
			<LayoutPanel
				header={
					<UserDetailInfoGridHeader
						{...{ onSave, isEditing, user, onUpdateCallback }}
						onEdit={() => setIsEditing(true)}
						onCancel={handleCancelSave}
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
							<EmailVerifiedField
								user={user}
								isEditing={isEditing}
								emailVerification={emailVerification}
								setVerificationStatus={(isVerified) =>
									onUpdateEmailVerificationStatusCallback(user.user.id, isVerified)
								}
								sendVerification={() => onSendEmailVerificationCallback(user)}
							/>
						}
					/>
					<UserDetailInfoGridItem
						label={"Phone Number:"}
						body={recipeId === "passwordless" ? phone : NON_APPLICABLE_TEXT}
					/>
					<UserDetailInfoGridItem
						label={"Password:"}
						body={
							recipeId === "emailpassword" ? (
								<button
									className="flat link"
									onClick={openChangePasswordModal}>
									Change Password
								</button>
							) : (
								NON_APPLICABLE_TEXT
							)
						}
					/>
					<UserDetailInfoGridItem
						label={"Provider | Provider user id:"}
						body={
							recipeId === "thirdparty" ? (
								<UserDetailProviderBox user={userState.user} />
							) : (
								NON_APPLICABLE_TEXT
							)
						}
					/>
				</div>
			</LayoutPanel>
		</div>
	);
};

export default UserDetailInfoGrid;
