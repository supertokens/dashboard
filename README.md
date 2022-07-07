# Dashboard

## Setup and installation

1. Clone the dashboard repository

2. Install node dependencies

```bash
npm install
```

3. Clone supertokens-node and switch to the desired branch

4. Link supertokens-node

```bash
cd ../supertokens-node # (Use the path where you clone the repo)
npm run link
cd ../dashboard
npm link supertokens-node
```

### Project structure

Largely the project is divided into 4 major parts

1. React Application

This is the frontend for the dashboard, during development the output is created in a `debug` folder (not checked into git).

2. Dev Server

This is a simple express application that uses `supertokens-node` with only the Dashboard recipe initialised.

3. Debug output (`debug`)

The output files (bundle, assets etc) when running the react app in debug mode. This folder is not checked into version control

4. Production output (`build`)

The output files for production builds. This folder is checked into version control

## Dev workflow

1. Start the application

```bash
npm run start
```

This will
- start a webpack dev server for the react app
- start the api server

The API server will start on `http://localhost:3001`, you can access the dashboard on `http://localhost:3001/auth/dashboard`

NOTE: When running the development app you will see a CORB warning in the console, this is expected because webpack dev server does not generate individual css files. In production mode the request will work as expected

2. Making changes

### Frontend changes

If you want to make changes to the dashboard, edit files in `/src/`. (Hot reload works)

1. When loading images and other assets, do not use relative paths directly. Use the `getImageUrl` and `getStaticBasePath` functions. This is because the dashboard is served by the backend SDK and not directly

2. When adding images make sure to import them in `src/images.ts`. This is to make sure webpack will output them when building the bundle

### Backend Changes

1. Make changes to supertokens-node and build
2. Quit and re-run `npm run start` to see the changes

### Additional Information (Safe to skip)

- This project has ejected react scripts to allow modifications to webpack