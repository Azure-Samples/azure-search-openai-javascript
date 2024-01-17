import NextAuth, { type AuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import AzureADB2CProvider from 'next-auth/providers/azure-ad-b2c';

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    // we will need to write the docs for this to work
    // https://next-auth.js.org/providers/azure-ad-b2c
    // TODO: update docs of next-auth with EntraID
    AzureADB2CProvider({
      clientId: process.env.AZUREADB2C_CLIENT_ID as string,
      clientSecret: process.env.AZUREADB2C_CLIENT_SECRET as string,
      tenantId: process.env.AZUREADB2C_TENANT_ID as string,
    }),
  ],
};

export default NextAuth(authOptions);
