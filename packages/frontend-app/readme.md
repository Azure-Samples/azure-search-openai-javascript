## Azure OpenAI JavaScript Sample - Frontend

This folder contains a single web component built with LitElement that can be used to interact with the Azure OpenAI API.

It is a classic chat UI that can be used to send messages to the API and receive responses.

## Technical stack

The following technologies are part of the frontend application:

- [Lit](https://lit.dev) and LitElement
- [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Vite](https://vitejs.dev/guide/) and [Rollup](https://rollupjs.org/introduction/) for local development, bundling and serving
- [TypeScript](https://www.typescriptlang.org/)
- [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) for code linting and formatting
- [Jest](https://jestjs.io/) for unit testing

## Configuration

The frontend application is configured using a global configuration file. You can enable or disable the default prompts, and configure the default prompt texts, the API endpoint and other settings.

All texts and labels are configurable to match your use case. To customize the texts, please edit the [global config](./src/config/globalConfig.js) file.

## Running the application

To run the application locally, you must install [Node.js LTS](https://nodejs.org) and make sure you can run `npm` commands from your terminal.

Then you can proceed by following these steps:

- To install all npm dependencies, please run `npm install`. This is a npm workspace, so all dependencies will be installed in the root folder.
- To start the local development server, open a new terminal and run `npm run start`. This will start the local development server on port 8000.
- To run the unit tests, open a new terminal and run `npm run test`. This will run all unit tests and generate a coverage report. (TBD - not yet implemented-)
- To build the application, open a new terminal and run `npm run build`. This will generate a production build in the `dist` folder.

## Testing

TBD

## Starting the local API

For local development, you can use the [local API](../search/README.md) to test the application.

The development server will proxy all requests to the local API, so you can use the application as if it was running in production. It runs on port 3000. CORS is enabled, so you can also use the API directly from your browser.

## Deploying the app to Azure Static Web Apps

You can deploy to [Azure Static Web Apps](https://docs.microsoft.com/azure/static-web-apps/overview) by using the [Azure Static Web Apps CLI](https://learn.microsoft.com/azure/static-web-apps/static-web-apps-cli-deploy) or the whole infrastructure with [Bicep](https://bicep.dev/) using the [Azure Developer CLI](https://learn.microsoft.com/azure/developer/azure-developer-cli/overview).

We will soon support [Terraform deployment](https://learn.microsoft.com/azure/developer/azure-developer-cli/use-terraform-for-azd).
