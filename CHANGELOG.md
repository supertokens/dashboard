# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

## [unreleased]

## [0.13.0]

-   Adds support for SAML metadata

## [0.12.0]

-   Adds Multitenancy support to the dashboard

## [0.11.2] - 2024-05-23

-   Fixes link to swaggerhub for create new user popup

## [0.11.1] - 2024-04-01

-   Fixes a regression bug in user management dashboard that causes the add user button to not be visible when there is only one tenant.

## [0.11.0] - 2024-03-20

-   Removes the tenants list API and uses the login methods API to get tenants and its login methods

## [0.10.5] - 2024-03-19

-   Fixes UI bugs on search and Login methods section in userDetails page.

## [0.10.4] - 2024-03-08

-   Improves UX when deleting a user from the dashboard.
-   Fixes Deleting linked accounts on user details page.

## [0.10.3] - 2024-01-26

-   Fixes scroll issues on diffrent browsers.

## [0.10.2] - 2024-01-26

-   Fix typo on user roles section on user details page.

## [0.10.1] - 2024-01-09

-   Fixed access denied modals zIndex value.

## [0.10.0] - 2023-12-22

-   Added Creating Passwordless and EmailPassword users from the user management dashboard.

## [0.9.1] - 2023-12-19

-   Improve UX when showing feature not enabled message for UserRoles recipe.

## [0.9.0] - 2023-11-17

-   Adds user roles and permissions feature to dashboard.

## [0.8.6] - 2023-11-15

-   Adds click action to the entire user row.

## [0.8.5] - 2023-10-5

-   Fixes showing email verification UI even though it's not initialised.

## [0.8.4] - 2023-09-29

-   Fixes dashboard signin form input styles issue.

## [0.8.3] - 2023-09-29

-   Fixes dashboard signin form styles issue.

## [0.8.2] - 2023-09-20

-   Fixes an issue where user details would not load if user meta data was not enabled in the backend

## [0.8.1] - 2023-09-18

-   Updates the text for the popup that shows when deleting a user to explain that it will also delete all linked accounts

## [0.8.0] - 2023-09-14

-   Adds support for account linking

## [0.7.2] - 2023-09-11

-   Enforces read, write permissions for allowed user on the user management dashboard.
-   Changes an asset to match the rest of the site. (Credit: [karishmashuklaa](https://github.com/karishmashuklaa))

## [0.7.1] - 2023-08-03

-   Fixed issues where DELETE request had header `"Content-Type": "application/json"`

## [0.7.0] - 2023-07-18

-   Adds the ability to choose a tenant when viewing the list of users
-   User details now displays all the tenants associated with that user

## [0.6.7] - 2023-06-29

-   Fixes an issue where trying to update a user's metadata would result in a screen error if the edited meta data was an invalid JSON. The error is now a local error for the meta data section in the case of failures.

## [0.6.6] - 2023-05-26

-   Fixes an issue where updating user meata data would result in an error if the entire field was cleared

## [0.6.5] - 2023-05-25

-   Fixes an issue where the user's initial would render as "FF" if the user metadata recipe was not initialised

## [0.6.4] - 2023-05-05

-   Fixes an issue where the sign in form would not work with auto filled entries

## [0.6.3] - 2023-04-115

-   Fixes an issues where search was enabled even for older versions.

## [0.6.2] - 2023-04-14

-   Fixes an issues where searching from any other page other than first one would result in in-correct results

## [0.6.1] - 2023-04-06

-   Attempts to fix an issues where searching from any other page other than first one would result in in-correct results

## [0.6.0] - 2023-03-31

-   Adds search functionality to the dashboard

## [0.5.0] - 2023-03-29

-   Adds telemetry to the dashboard

## [0.4.5] - 2023-03-10

-   Fixes an issue where notifications would appear behind the sign out button

## [0.4.4] - 2023-03-08

-   General aesthetic fixes for the dashboard UI

## [0.4.3] - 2023-03-06

-   Fixes an issue where entering an incorrect API key would refresh the page

## [0.4.2] - 2023-02-27

-   Removes logic where user's email and phone was obfuscated if the demo core connection uri was used
-   Changes the title on the sign in page

## [0.4.1] - 2023-02-22

-   Fixes an issue where user's emails and phones were obfuscated

## [0.4.0] - 2023-02-22

-   Adds email password based login to the dashboard that can be used instead of API keys

## [0.3.3] - 2023-02-07

-   Added build files to ensure the previous version becomes effective.

## [0.3.2] - 2023-02-05

-   Imported the static logo from the folders instead of fetching it from githubusercontent (which is unaccessible for some Indian ISP's, resulting in broken images).

## [0.3.1] - 2023-01-06

-   Add a banner to indicate beta status

## [0.3.0] - 2022-12-26

-   Fixes an issue with user details if the user does not exist

## [0.2.5] - 2022-12-12

-   Adds an empty request body for all APIs by default to prevent body validation failures (https://github.com/supertokens/dashboard/issues/59)

## [0.2.4] - 2022-11-28

-   Fixed an issue where the user's name would render incorrectly

## [0.2.3] - 2022-11-18

-   Fixed an issue where updating user information for third party recipe users would fail

## [0.2.2] - 2022-11-18

-   Fixed a UI glitch when entering the api key

## [0.2.1] - 2022-11-18

### Fixed

-   Fixed an issue where user details would fail to load because of user meta data not being enabled

## [0.2.0] - 2022-11-17

### Features

-   Added user detail page to show the detailed info from the list of users
-   Add the ability to edit user information

## [0.1.3] - 2022-09-26

### Changes

-   Enhancements

## [0.1.2] - 2022-09-15

### Fixes

-   Fixes an issue where validation error for the API key would render incorrectly

## [0.1.1] - 2022-09-13

### Changes

-   Hides user input when entering the API key

## [0.1.0] - 2022-08-25

### Features

-   Added a paginated list of all users that have signed up to your app
-   Added API key based authentication
