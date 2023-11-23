# Dashboard

## Setup and installation

1. Clone the dashboard repository

2. Install node dependencies

```bash
npm install
```

3. Install git hooks

```bash
npm run set-up-hooks
```

4. Clone supertokens-node and switch to the desired branch

5. Link supertokens-node

```bash
cd ../supertokens-node # (Use the path where you clone the repo)
npm link
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

-   start a webpack dev server for the react app
-   start the api server

The API server will start on `http://localhost:3001`, you can access the dashboard on `http://localhost:3001/auth/dashboard`

NOTE: When running the development app you will see a CORS warning in the console, this is expected because webpack dev server does not generate individual css files. In production mode the request will work as expected

2. Making changes

### Frontend changes

If you want to make changes to the dashboard, edit files in `/src/`. (Hot reload works)

1. When loading images and other assets, do not use relative paths directly. Use the `getImageUrl` and `getStaticBasePath` functions. This is because the dashboard is served by the backend SDK and not directly

2. When adding images make sure to import them in `src/images.ts`. This is to make sure webpack will output them when building the bundle

NOTE: All images from the project get added to `/static/media` in the build folder. This means that image names need to be globally unique (`images/logo.png`, `images/images/logo.png` would only result in one image in the build output)

### Backend Changes

1. Make changes to supertokens-node and build
2. Quit and re-run `npm run start` to see the changes

### Making changes to the API spec

When making changes to the `api_spec.yaml` file

-   1. Go to [the swagger editor](https://editor.swagger.io/)
-   2. Copy / paste the contents of the `.yaml` file into the editor, and then you should see the API docs on the right of the screen.
-   3. Make changes to the online editor and then copy / paste the content back into the `.yaml` file
-   4. Issue a PR to the appropriate branch (refer to the branching section above)

### Testing in production mode

1. Create a production build

```
npm run build
```

This creates/updates the `build` folder in the repository

2. Serve the production bundle

```
serve -s build
```

3. Start the dev server

```
npm run start-dev-server
```

You can now access the production build of the dashboard on `http://localhost:3001/auth/dashboard`

### Additional Information (Safe to skip)

-   This project has ejected react scripts to allow modifications to webpack
-   Versioning will follow X.Y.Z format but with slightly different rules than semantic versioning
    -   Dashboard changes that involve adding a new feature and require backend SDK changes will increment the Y version
    -   Dashboard changes that involve adding new features and do not require backend SDK changes will increment the Z version
    -   UI changes that modify existing features or are fixes or enhancements increment the Z version
    -   X version changes should be reserved for overhauls of the entire dashboard
-   After making a change, if it is important for the changes to reflect immediately for a patch release you can use https://purge.jsdelivr.net/gh/supertokens/dashboard@vX.Y/build/static/js/bundle.js to purge jsdelivr cache. Make sure to change `X.Y` with the version you want to purge the cache for. Also, send a GET request to https://purge.jsdelivr.net/gh/supertokens/dashboard@vX.Y/build/static/css/main.css
