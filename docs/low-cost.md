# Reduce deployment costs

This AI RAG chat application is designed to be easily deployed using the Azure Developer CLI, which provisions the infrastructure according to the Bicep files in the `infra` folder. Those files describe each of the Azure resources needed, and configures their SKU (pricing tier) and other parameters. Many Azure services offer a free tier, but the infrastructure files in this project do *not* default to the free tier as there are often limitations in that tier.

However, if your goal is to minimize costs while prototyping your application, follow the steps below *before* running `azd up`. Once you've gone through these steps, return to the [deployment steps](../README.md#azure-deployment).

1. Log in to your Azure account using the Azure Developer CLI:

    ```shell
    azd auth login
    ```

1. Create a new azd environment for the free resource group:

    ```shell
    azd env new
    ```

    Enter a name that will be used for the resource group.
    This will create a new folder in the `.azure` folder, and set it as the active environment for any calls to `azd` going forward.

1. Use the free tier of Azure AI Search:

    ```shell
    azd env set AZURE_SEARCH_SERVICE_SKU free
    ```

    Limitations:
    1. You are only allowed one free search service across all regions.
    2. The free tier does not support semantic ranker. Note that will generally result in [decreased search relevance](https://techcommunity.microsoft.com/blog/azure-ai-services-blog/azure-ai-search-outperforming-vector-search-with-hybrid-retrieval-and-ranking-ca/3929167).

