## Azure Open AI JavaScript Sample - Frontend

This folder contains a web component with LitElement that can be used to interact with the Azure Open AI API. 

It is a standard chat UI that can be used to send messages to the API and receive responses. 

## Technical stack

The following technologies are part of the frontend application:
- [Lit](https://lit.dev) and LitElement
- [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Modern Web Dev Server](https://modern-web.dev/docs/dev-server/overview/) for local development
- [TypeScript](https://www.typescriptlang.org/)
- [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) for code linting and formatting
- [Jest](https://jestjs.io/) for unit testing

## Configuration

All texts and labels are configurable to match your use-case. To reconfigure the texts, please edit the [global config](./src/config/globalConfig.ts) file.

## Running the application

To run the application locally, you must install [Node.js LTS](https://nodejs.org) and make sure you can run `npm` commands from your terminal.

Then you can proceed by following these steps:

- To install all npm dependencies, please run `npm install`
- Transpile all TypeScript files running `npm run build`. This will also run the linter and watchers.
- To start the local development server, open a new terminal and run `npm run start`. This will start the local development server on port 8000. 

## Testing
TBD

## Testing the API locally with Azure Functions
Install the [Azure Static Web Apps CLI](https://docs.microsoft.com/en-us/azure/static-web-apps/local-development) and run `swa start` to start the local development server. This will also start the Azure Functions API locally.

You can access the application on `http://localhost:4280` and the API on `http://localhost:7071/api`.

## Deploying the app to Azure Static Web Apps
TBD