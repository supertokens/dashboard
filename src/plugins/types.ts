// import { Layout } from "@features/layout";
// import type { ComponentOverride } from "./componentOverride";
// import { Header, Sidebar } from "@features/layout/components";
// import {
// 	Auth,
// 	SignInContent,
// 	SignInContentWrapper,
// 	SignInWithApiKeyContent,
// 	SignOutBtn,
// 	SignUpOrResetPasswordContent,
// } from "@features/auth";
// import AuthWrapper from "@features/auth/components/AuthWrapper";
// import RolesListHeader from "@features/roles-and-permissions/components/RolesListHeader";
// import RolesListTable from "@features/roles-and-permissions/components/RolesListTable";
// import RolesList from "@features/roles-and-permissions/components/RolesList";
// import RolesListItem from "@features/roles-and-permissions/components/RolesListItem";
// import RolesListFooter from "@features/roles-and-permissions/components/RolesListFooter";
// import CreateNewRoleModal from "@features/roles-and-permissions/modals/CreateNewRoleModal";
// import AddPermissionModal from "@features/roles-and-permissions/modals/AddPermissionModal";
// import DeleteRoleModal from "@features/roles-and-permissions/modals/DeleteRoleModal";
// import RemoveAccessModal from "@features/roles-and-permissions/modals/RemoveAccessModal";
// import DeletePermissionModal from "@features/roles-and-permissions/modals/DeletePermissionModal";
// import ManageAccessHeader from "@features/roles-and-permissions/roles-details/ManageAccessHeader";
// import ManageAccessFooter from "@features/roles-and-permissions/roles-details/ManageAccessFooter";
// import TenantsList from "@features/tenants/components/TenantsList";
// import TenantsListHeader from "@features/tenants/components/TenantsListHeader";
// import TenantsListFooter from "@features/tenants/components/TenantsListFooter";
// import TenantsListTable from "@features/tenants/components/TenantsListTable";
// import TenantsListItem from "@features/tenants/components/TenantsListItem";
// import DeleteProviderConfigModal from "@features/tenants/modals/DeleteProviderConfigModal";
// import CreateNewTenantModal from "@features/tenants/modals/CreateNewTenantModal";
// import EditPluginPropertyModal from "@features/tenants/modals/EditPluginPropertyModal";
// import DeleteTenantModal from "@features/tenants/modals/DeleteTenantModal";
// import UneditableConfigurationModal from "@features/tenants/modals/UneditableConfigurationModal";
// import EditConfigurationPropertyModal from "@features/tenants/modals/EditConfigurationPropertyModal";
// import AddNewProviderModal from "@features/tenants/modals/AddNewProviderModal";
// import TenantDetails, { TenantDetailContent } from "@features/tenants/tenant-details/TenantDetails";
// import { SecondaryFactorItem, SecondaryFactors } from "@features/tenants/tenant-details/SecondaryFactors";
// import { LoginMethodItem, LoginMethods } from "@features/tenants/tenant-details/LoginMethods";
// import { ProviderConfigWrapper, Providers } from "@features/tenants/tenant-details/Providers";
// import CoreConfiguration from "@features/tenants/tenant-details/core-configuration/CoreConfiguration";
// import CoreConfigurationTable from "@features/tenants/tenant-details/core-configuration/CoreConfigurationTable";
// import CoreConfigTableRow from "@features/tenants/tenant-details/core-configuration/CoreConfigTableRow";
// import PluginPropertiesSection from "@features/tenants/tenant-details/core-configuration/PluginPropertiesSection";
// import { ProviderConfiguration } from "@features/tenants/tenant-details/provider-configuration/ProviderConfiguration";
// import { AdditionalConfigForms } from "@features/tenants/tenant-details/provider-configuration/AdditionalConfigForms";
// import { ClientConfigSection } from "@features/tenants/tenant-details/provider-configuration/components/ClientConfigSection";
// import { EmailSelect } from "@features/tenants/tenant-details/provider-configuration/components/EmailSelect";
// import { ProviderConfigCancelButton } from "@features/tenants/tenant-details/provider-configuration/components/ProviderConfigCancelButton";
// import { ProviderConfigInput } from "@features/tenants/tenant-details/provider-configuration/components/ProviderConfigInput";
// import { ProviderConfigInputLabel } from "@features/tenants/tenant-details/provider-configuration/components/ProviderConfigInputLabel";
// import { ProviderConfigInputRow } from "@features/tenants/tenant-details/provider-configuration/components/ProviderConfigInputRow";
// import { ProviderConfigKeyValue } from "@features/tenants/tenant-details/provider-configuration/components/ProviderConfigKeyValue";
// import { ProviderConfigSeparator } from "@features/tenants/tenant-details/provider-configuration/components/ProviderConfigSeparator";
// import { ProviderConfigSuffixInput } from "@features/tenants/tenant-details/provider-configuration/components/ProviderConfigSuffixInput";
// import { UserInfoMapSection } from "@features/tenants/tenant-details/provider-configuration/components/UserInfoMapSection";

export interface ComponentOverrideMap extends Record<string, undefined | ((...args: any[]) => any)> {}
// 	// layout
// 	Layout_Override?: ComponentOverride<typeof Layout>;
// 	Header_Override?: ComponentOverride<typeof Header>;
// 	Sidebar_Override?: ComponentOverride<typeof Sidebar>;
// 	// auth
// 	Auth_Override?: ComponentOverride<typeof Auth>;
// 	AuthWrapper_Override?: ComponentOverride<typeof AuthWrapper>;
// 	SignInContent_Override?: ComponentOverride<typeof SignInContent>;
// 	SignInContentWrapper_Override?: ComponentOverride<typeof SignInContentWrapper>;
// 	SignInWithApiKeyContent_Override?: ComponentOverride<typeof SignInWithApiKeyContent>;
// 	SignOutBtn_Override?: ComponentOverride<typeof SignOutBtn>;
// 	SignUpOrResetPasswordContent_Override?: ComponentOverride<typeof SignUpOrResetPasswordContent>;
// 	// roles-and-permissions - components
// 	RolesList_Override?: ComponentOverride<typeof RolesList>;
// 	RolesListHeader_Override?: ComponentOverride<typeof RolesListHeader>;
// 	RolesListFooter_Override?: ComponentOverride<typeof RolesListFooter>;
// 	RolesListTable_Override?: ComponentOverride<typeof RolesListTable>;
// 	RolesListItem_Override?: ComponentOverride<typeof RolesListItem>;
// 	// roles-and-permissions - modals
// 	CreateNewRoleModal_Override?: ComponentOverride<typeof CreateNewRoleModal>;
// 	AddPermissionModal_Override?: ComponentOverride<typeof AddPermissionModal>;
// 	DeleteRoleModal_Override?: ComponentOverride<typeof DeleteRoleModal>;
// 	RemoveAccessModal_Override?: ComponentOverride<typeof RemoveAccessModal>;
// 	DeletePermissionModal_Override?: ComponentOverride<typeof DeletePermissionModal>;
// 	// roles-and-permissions - roles-details
// 	ManageAccessHeader_Override?: ComponentOverride<typeof ManageAccessHeader>;
// 	ManageAccessFooter_Override?: ComponentOverride<typeof ManageAccessFooter>;
// 	// tenants - components
// 	TenantsList_Override?: ComponentOverride<typeof TenantsList>;
// 	TenantsListHeader_Override?: ComponentOverride<typeof TenantsListHeader>;
// 	TenantsListFooter_Override?: ComponentOverride<typeof TenantsListFooter>;
// 	TenantsListTable_Override?: ComponentOverride<typeof TenantsListTable>;
// 	TenantsListItem_Override?: ComponentOverride<typeof TenantsListItem>;
// 	// tenants - modals
// 	DeleteProviderConfigModal_Override?: ComponentOverride<typeof DeleteProviderConfigModal>;
// 	CreateNewTenantModal_Override?: ComponentOverride<typeof CreateNewTenantModal>;
// 	EditPluginPropertyModal_Override?: ComponentOverride<typeof EditPluginPropertyModal>;
// 	DeleteTenantModal_Override?: ComponentOverride<typeof DeleteTenantModal>;
// 	UneditableConfigurationModal_Override?: ComponentOverride<typeof UneditableConfigurationModal>;
// 	EditConfigurationPropertyModal_Override?: ComponentOverride<typeof EditConfigurationPropertyModal>;
// 	AddNewProviderModal_Override?: ComponentOverride<typeof AddNewProviderModal>;
// 	// tenants - tenant-details
// 	TenantDetails_Override?: ComponentOverride<typeof TenantDetails>;
// 	TenantDetailContent_Override?: ComponentOverride<typeof TenantDetailContent>;
// 	SecondaryFactors_Override?: ComponentOverride<typeof SecondaryFactors>;
// 	SecondaryFactorItem_Override?: ComponentOverride<typeof SecondaryFactorItem>;
// 	LoginMethods_Override?: ComponentOverride<typeof LoginMethods>;
// 	LoginMethodItem_Override?: ComponentOverride<typeof LoginMethodItem>;
// 	Providers_Override?: ComponentOverride<typeof Providers>;
// 	ProviderConfigWrapper_Override?: ComponentOverride<typeof ProviderConfigWrapper>;
// 	// tenants - tenant-details - core-configuration
// 	CoreConfiguration_Override?: ComponentOverride<typeof CoreConfiguration>;
// 	CoreConfigurationTable_Override?: ComponentOverride<typeof CoreConfigurationTable>;
// 	CoreConfigTableRow_Override?: ComponentOverride<typeof CoreConfigTableRow>;
// 	PluginPropertiesSection_Override?: ComponentOverride<typeof PluginPropertiesSection>;
// 	// tenants - tenant-details - provider-configuration
// 	ProviderConfiguration_Override?: ComponentOverride<typeof ProviderConfiguration>;
// 	AdditionalConfigForms_Override?: ComponentOverride<typeof AdditionalConfigForms>;
// 	ClientConfigSection_Override?: ComponentOverride<typeof ClientConfigSection>;
// 	EmailSelect_Override?: ComponentOverride<typeof EmailSelect>;
// 	ProviderConfigCancelButton_Override?: ComponentOverride<typeof ProviderConfigCancelButton>;
// 	ProviderConfigInput_Override?: ComponentOverride<typeof ProviderConfigInput>;
// 	ProviderConfigInputLabel_Override?: ComponentOverride<typeof ProviderConfigInputLabel>;
// 	ProviderConfigInputRow_Override?: ComponentOverride<typeof ProviderConfigInputRow>;
// 	ProviderConfigKeyValue_Override?: ComponentOverride<typeof ProviderConfigKeyValue>;
// 	ProviderConfigSeparator_Override?: ComponentOverride<typeof ProviderConfigSeparator>;
// 	ProviderConfigSuffixInput_Override?: ComponentOverride<typeof ProviderConfigSuffixInput>;
// 	UserInfoMapSection_Override?: ComponentOverride<typeof UserInfoMapSection>;
// }
