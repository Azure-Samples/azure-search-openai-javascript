## Azure Open AI JavaScript Sample - Frontend

This folder contains a FAST/FluentUI web component that can be used to interact with the Azure Open AI API. 

It is a standard chat UI that can be used to send messages to the API and receive responses. 

## Technical stack

The following technologies are part of the frontend application:
- [Fast](https://www.fast.design/docs/components/getting-started) and [Fluent UI](https://fluent1.microsoft.design/#/web) for the UI components.
- [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [TypeScript](https://www.typescriptlang.org/)
- [Rollup](https://rollupjs.org/guide/en/) for bundling and dev server

## Configuration

All texts and labels are configurable to match your use-case. To reconfigure the texts, please edit the [global config](./src/config/globalConfig.ts) file.

## Running the application

To run the application locally, you must install [Node.js LTS](https://nodejs.org) and make sure you can run `npm` commands from your terminal.

Then you can proceed by following these steps:

- To install all npm dependencies, please run `npm install`
- Transpile all TypeScript files running `npm run build`.

## Testing
TBD

## Testing the API locally with Azure Functions
Install the [Azure Static Web Apps CLI](https://docs.microsoft.com/en-us/azure/static-web-apps/local-development) and run `swa start` to start the local development server. This will also start the Azure Functions API locally.

You can access the application on `http://localhost:4280` and the API on `http://localhost:7071/api`.

## Deploying the app to Azure Static Web Apps
TBD