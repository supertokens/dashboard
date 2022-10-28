import { FC, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { formatLongDate, getImageUrl } from "../../../utils";
import { isNotEmpty, validateEmail, validatePhoneNumber } from "../../../utils/form";
import { getUserEmailVerificationStatus } from "../../api/user/email/verify";
import { PopupContentContext } from "../../contexts/PopupContentContext";
import {
	EmailVerificationStatus,
	FEATURE_NOT_ENABLED_TEXT,
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
	| "onUpdateCallback"
	| "onSendEmailVerificationCallback"
	| "onUpdateEmailVerificationStatusCallback"
	| "onChangePasswordCallback"
> & {
	userDetail: UserWithRecipeId;
};

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

type EmailVerifiedFieldProps = {
	user: UserWithRecipeId;
	isEditing: boolean;
	setVerificationStatus: (isVerified: boolean) => void;
	sendVerification: () => void;
};

export const EmailVerifiedField: FC<EmailVerifiedFieldProps> = (props: EmailVerifiedFieldProps) => {
	const { user, isEditing, setVerificationStatus, sendVerification } = props;
	const { recipeId } = user;

	const [emailVerificationStatus, setEmailVerificationStatus] = useState<EmailVerificationStatus | undefined>(
		undefined
	);

	const isApplicable = isEmailVerificationApplicable(recipeId);

	const fetchEmailVerificationStatus = useCallback(async () => {
		if (isApplicable) {
			return;
		}

		const response: EmailVerificationStatus = await getUserEmailVerificationStatus(user.user.id);
		setEmailVerificationStatus(response);
	}, []);

	useEffect(() => {
		void fetchEmailVerificationStatus();
	}, [fetchEmailVerificationStatus]);

	if (!isApplicable) {
		return <>{NON_APPLICABLE_TEXT}</>;
	}

	if (emailVerificationStatus === undefined) {
		return <>Loading...</>;
	}

	const { status } = emailVerificationStatus;
	if (status === FEATURE_NOT_ENABLED_TEXT) {
		return <>Feature not enabled</>;
	}

	const { isVerified } = emailVerificationStatus;

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
		userDetail,
		onUpdateCallback,
		onSendEmailVerificationCallback,
		onUpdateEmailVerificationStatusCallback,
		onChangePasswordCallback,
	} = props;
	const [userState, setUserState] = useState<UserWithRecipeId>({ ...userDetail });
	const { showModal } = useContext(PopupContentContext);
	const { recipeId } = userState;
	const { firstName, lastName, timeJoined, email } = userState.user;
	const [isEditing, setIsEditing] = useState(false);

	const onSave = useCallback(() => {
		onUpdateCallback(userDetail.user.id, userState);
		setIsEditing(false);
	}, [onUpdateCallback, userState, userDetail]);

	const updateUserDataState = useCallback((updatedUser: Partial<UserWithRecipeId["user"]>) => {
		setUserState((currentState) => {
			return { ...currentState, user: { ...currentState.user, ...updatedUser } } as UserWithRecipeId;
		});
	}, []);

	useEffect(() => setUserState(userDetail), [userDetail]);

	// validate email if `isEditing=true`
	const emailError = useCallback(() => {
		if (!isEditing) {
			return;
		}
		if (isNotEmpty(email)) {
			return !validateEmail(email!) ? "Email address is invalid" : undefined;
		} else if (userDetail.user.email !== undefined) {
			return "Email cannot be empty";
		}
	}, [email, userDetail.user.email, isEditing])();

	// validate phone if `isEditing=true`
	const phoneNumber = recipeId === "passwordless" ? userState.user.phoneNumber : undefined;
	const phoneNumberProps = userDetail.recipeId === "passwordless" ? userDetail.user.phoneNumber : undefined;
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
				userDetail.recipeId === "passwordless" && userDetail.user.phoneNumber !== undefined
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
		setUserState(userDetail);
	}, [userDetail]);

	const handleChangePassword = useCallback(
		(password?: string) => {
			if (password !== undefined) {
				onChangePasswordCallback(userDetail.user.id, password);
			}
		},
		[onChangePasswordCallback, userDetail.user.id]
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
						{...{ onSave, isEditing, user: userDetail, onUpdateCallback }}
						onEdit={() => setIsEditing(true)}
						onCancel={handleCancelSave}
						isSaveDisabled={saveDisabled}
					/>
				}>
				<div className="user-detail__info-grid__grid">
					<UserDetailInfoGridItem
						label={"First Name:"}
						body={firstName}
						tooltip={<NameTooltip fieldName="first_name" />}
					/>
					<UserDetailInfoGridItem
						label={"Last Name:"}
						body={lastName}
						tooltip={<NameTooltip fieldName="last_name" />}
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
								user={userDetail}
								isEditing={isEditing}
								setVerificationStatus={(isVerified) =>
									onUpdateEmailVerificationStatusCallback(userDetail.user.id, isVerified)
								}
								sendVerification={() => onSendEmailVerificationCallback(userDetail)}
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
