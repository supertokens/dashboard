# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

## [unreleased]

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
