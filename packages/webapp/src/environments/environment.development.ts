export const environment = {
    apiUrl: process.env["CODESPACE_NAME"] ? `https://${process.env["CODESPACE_NAME"]}-3000.${process.env["GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN"]}` : 'http://localhost:3000',
};
