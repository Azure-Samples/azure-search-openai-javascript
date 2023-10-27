The tests use [k6](https://k6.io/) to perform load testing.

# Install k6

k6 is already included in the dev container, so no further installation is required.

For manual installation, refer to [k6 installation docs](https://k6.io/docs/get-started/installation/).

# To run the test

Set the following environment variables to point to the deployment.

```
export WEBAPP_URI=<webapp_uri>
export SEARCH_API_URI=<search_api_uri>
```

Once set, you can now run load tests using the following command:

```
npm run test:load
```
