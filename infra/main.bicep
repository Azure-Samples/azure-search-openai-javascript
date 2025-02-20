targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the the environment which is used to generate a short unique hash used in all resources.')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

param resourceGroupName string = ''
param containerAppsEnvironmentName string = ''
param containerRegistryName string = ''
param webAppName string = 'webapp'
param searchApiName string = 'search'
param searchApiImageName string = ''
param indexerApiName string = 'indexer'
param indexerApiImageName string = ''

param logAnalyticsName string = ''
param applicationInsightsName string = ''
param applicationInsightsDashboardName string = ''

param searchServiceName string = ''
param searchServiceResourceGroupName string = ''
param searchServiceLocation string = ''
// The free tier does not support managed identity (required) or semantic search (optional)
@allowed(['basic', 'standard', 'standard2', 'standard3', 'storage_optimized_l1', 'storage_optimized_l2'])
param searchServiceSkuName string
param searchIndexName string

param storageAccountName string = ''
param storageResourceGroupName string = ''
param storageResourceGroupLocation string = location
param storageContainerName string = 'content'
param storageSkuName string

param openAiServiceName string = ''
param openAiResourceGroupName string = ''
@description('Location for the OpenAI resource group')
@allowed(['australiaeast', 'canadaeast', 'eastus', 'eastus2', 'francecentral', 'japaneast', 'northcentralus', 'swedencentral', 'switzerlandnorth', 'uksouth', 'westeurope'])
@metadata({
  azd: {
    type: 'location'
  }
})
param openAiResourceGroupLocation string
param openAiSkuName string = 'S0'

@description('Location for the Static Web App')
@allowed(['westus2', 'centralus', 'eastus2', 'westeurope', 'eastasia', 'eastasiastage'])
@metadata({
  azd: {
    type: 'location'
  }
})
param webAppLocation string

param chatGptDeploymentName string // Set in main.parameters.json
param chatGptDeploymentCapacity int = 30
param chatGptModelName string // Set in main.parameters.json
param chatGptModelVersion string // Set in main.parameters.json
param embeddingDeploymentName string = 'embedding'
param embeddingDeploymentCapacity int = 30
param embeddingModelName string = 'text-embedding-ada-002'

@description('Id of the user or app to assign application roles')
param principalId string = ''

param allowedOrigin string

// Allow to override the default backend
param backendUri string = ''

// Only needed for CD due to internal policies restrictions
param aliasTag string = ''
// Differentiates between automated and manual deployments
param isContinuousDeployment bool = false

var abbrs = loadJsonContent('abbreviations.json')
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))
var tags = union({ 'azd-env-name': environmentName }, empty(aliasTag) ? {} : { alias: aliasTag })
var allowedOrigins = empty(allowedOrigin) ? [webApp.outputs.uri] : [webApp.outputs.uri, allowedOrigin]

var indexerApiIdentityName = '${abbrs.managedIdentityUserAssignedIdentities}indexer-api-${resourceToken}'
var searchApiIdentityName = '${abbrs.managedIdentityUserAssignedIdentities}search-api-${resourceToken}'

// Organize resources in a resource group
resource resourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: !empty(resourceGroupName) ? resourceGroupName : '${abbrs.resourcesResourceGroups}${environmentName}'
  location: location
  tags: tags
}

resource openAiResourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' existing = if (!empty(openAiResourceGroupName)) {
  name: !empty(openAiResourceGroupName) ? openAiResourceGroupName : resourceGroup.name
}

resource searchServiceResourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' existing = if (!empty(searchServiceResourceGroupName)) {
  name: !empty(searchServiceResourceGroupName) ? searchServiceResourceGroupName : resourceGroup.name
}

resource storageResourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' existing = if (!empty(storageResourceGroupName)) {
  name: !empty(storageResourceGroupName) ? storageResourceGroupName : resourceGroup.name
}

// Monitor application with Azure Monitor
module monitoring './core/monitor/monitoring.bicep' = {
  name: 'monitoring'
  scope: resourceGroup
  params: {
    location: location
    tags: tags
    logAnalyticsName: !empty(logAnalyticsName) ? logAnalyticsName : '${abbrs.operationalInsightsWorkspaces}${resourceToken}'
    applicationInsightsName: !empty(applicationInsightsName) ? applicationInsightsName : '${abbrs.insightsComponents}${resourceToken}'
    applicationInsightsDashboardName: !empty(applicationInsightsDashboardName) ? applicationInsightsDashboardName : '${abbrs.portalDashboards}${resourceToken}'
  }
}

// Container apps host (including container registry)
module containerApps './core/host/container-apps.bicep' = {
  name: 'container-apps'
  scope: resourceGroup
  params: {
    name: 'containerapps'
    containerAppsEnvironmentName: !empty(containerAppsEnvironmentName) ? containerAppsEnvironmentName : '${abbrs.appManagedEnvironments}${resourceToken}'
    containerRegistryName: !empty(containerRegistryName) ? containerRegistryName : '${abbrs.containerRegistryRegistries}${resourceToken}'
    location: location
    tags: tags
    applicationInsightsName: monitoring.outputs.applicationInsightsName
    logAnalyticsWorkspaceName: monitoring.outputs.logAnalyticsWorkspaceName
    containerRegistryAdminUserEnabled: true
  }
}

// The application frontend
module webApp './core/host/staticwebapp.bicep' = {
  name: 'webapp'
  scope: resourceGroup
  params: {
    name: !empty(webAppName) ? webAppName : '${abbrs.webStaticSites}web-${resourceToken}'
    location: webAppLocation
    tags: union(tags, { 'azd-service-name': webAppName })
  }
}

// search API identity
module searchApiIdentity 'core/security/managed-identity.bicep' = {
  name: 'search-api-identity'
  scope: resourceGroup
  params: {
    name: searchApiIdentityName
    location: location
  }
}

// The search API
module searchApi './core/host/container-app.bicep' = {
  name: 'search-api'
  scope: resourceGroup
  params: {
    name: !empty(searchApiName) ? searchApiName : '${abbrs.appContainerApps}search-${resourceToken}'
    location: location
    tags: union(tags, { 'azd-service-name': searchApiName })
    containerAppsEnvironmentName: containerApps.outputs.environmentName
    containerRegistryName: containerApps.outputs.registryName
    identityName: searchApiIdentityName
    allowedOrigins: allowedOrigins
    containerCpuCoreCount: '1.0'
    containerMemory: '2.0Gi'
    secrets: [
      {
        name: 'appinsights-cs'
        value: monitoring.outputs.applicationInsightsConnectionString
      }
    ]
    env: [
      {
        name: 'AZURE_OPENAI_CHATGPT_DEPLOYMENT'
        value: chatGptDeploymentName
      }
      {
        name: 'AZURE_OPENAI_CHATGPT_MODEL'
        value: chatGptModelName
      }
      {
        name: 'AZURE_OPENAI_EMBEDDING_DEPLOYMENT'
        value: embeddingDeploymentName
      }
      {
        name: 'AZURE_OPENAI_EMBEDDING_MODEL'
        value: embeddingModelName
      }
      {
        name: 'AZURE_OPENAI_SERVICE'
        value: openAi.outputs.name
      }
      {
        name: 'AZURE_SEARCH_INDEX'
        value: searchIndexName
      }
      {
        name: 'AZURE_SEARCH_SERVICE'
        value: searchService.outputs.name
      }
      {
        name: 'AZURE_STORAGE_ACCOUNT'
        value: storage.outputs.name
      }
      {
        name: 'AZURE_STORAGE_CONTAINER'
        value: storageContainerName
      }
      {
        name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
        secretRef: 'appinsights-cs'
      }
      {
        name: 'AZURE_CLIENT_ID'
        value: searchApiIdentity.outputs.clientId
      }
    ]
    imageName: !empty(searchApiImageName) ? searchApiImageName : 'nginx:latest'
    targetPort: 3000
  }
}

// Indexer API identity
module indexerApiIdentity 'core/security/managed-identity.bicep' = {
  name: 'indexer-api-identity'
  scope: resourceGroup
  params: {
    name: indexerApiIdentityName
    location: location
  }
}

// The indexer API
module indexerApi './core/host/container-app.bicep' = {
  name: 'indexer-api'
  scope: resourceGroup
  params: {
    name: !empty(indexerApiName) ? indexerApiName : '${abbrs.appContainerApps}indexer-${resourceToken}'
    location: location
    tags: union(tags, { 'azd-service-name': indexerApiName })
    containerAppsEnvironmentName: containerApps.outputs.environmentName
    containerRegistryName: containerApps.outputs.registryName
    identityName: indexerApiIdentityName
    containerCpuCoreCount: '1.0'
    containerMemory: '2.0Gi'
    secrets: [
      {
        name: 'appinsights-cs'
        value: monitoring.outputs.applicationInsightsConnectionString
      }
    ]
    env: [
      {
        name: 'AZURE_OPENAI_CHATGPT_DEPLOYMENT'
        value: chatGptDeploymentName
      }
      {
        name: 'AZURE_OPENAI_CHATGPT_MODEL'
        value: chatGptModelName
      }
      {
        name: 'AZURE_OPENAI_EMBEDDING_DEPLOYMENT'
        value: embeddingDeploymentName
      }
      {
        name: 'AZURE_OPENAI_EMBEDDING_MODEL'
        value: embeddingModelName
      }
      {
        name: 'AZURE_OPENAI_SERVICE'
        value: openAi.outputs.name
      }
      {
        name: 'AZURE_SEARCH_INDEX'
        value: searchIndexName
      }
      {
        name: 'AZURE_SEARCH_SERVICE'
        value: searchService.outputs.name
      }
      {
        name: 'AZURE_STORAGE_ACCOUNT'
        value: storage.outputs.name
      }
      {
        name: 'AZURE_STORAGE_CONTAINER'
        value: storageContainerName
      }
      {
        name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
        secretRef: 'appinsights-cs'
      }
      {
        name: 'AZURE_CLIENT_ID'
        value: indexerApiIdentity.outputs.clientId
      }
    ]
    imageName: !empty(indexerApiImageName) ? indexerApiImageName : 'nginx:latest'
    targetPort: 3001
  }
}

module openAi 'core/ai/cognitiveservices.bicep' = {
  name: 'openai'
  scope: openAiResourceGroup
  params: {
    name: !empty(openAiServiceName) ? openAiServiceName : '${abbrs.cognitiveServicesAccounts}${resourceToken}'
    location: openAiResourceGroupLocation
    tags: tags
    sku: {
      name: openAiSkuName
    }
    disableLocalAuth: true
    deployments: [
      {
        name: chatGptDeploymentName
        model: {
          format: 'OpenAI'
          name: chatGptModelName
          version: chatGptModelVersion
        }
        sku: {
          name: 'Standard'
          capacity: chatGptDeploymentCapacity
        }
      }
      {
        name: embeddingDeploymentName
        model: {
          format: 'OpenAI'
          name: embeddingModelName
          version: '2'
        }
        capacity: embeddingDeploymentCapacity
      }
    ]
  }
}

module searchService 'core/search/search-services.bicep' = {
  name: 'search-service'
  scope: searchServiceResourceGroup
  params: {
    name: !empty(searchServiceName) ? searchServiceName : 'gptkb-${resourceToken}'
    location: !empty(searchServiceLocation) ? searchServiceLocation : location
    tags: tags
    authOptions: {
      aadOrApiKey: {
        aadAuthFailureMode: 'http401WithBearerChallenge'
      }
    }
    sku: {
      name: searchServiceSkuName
    }
    semanticSearch: searchServiceSkuName == 'standard' ? 'free' : 'disabled'
  }
}

module storage 'core/storage/storage-account.bicep' = {
  name: 'storage'
  scope: storageResourceGroup
  params: {
    name: !empty(storageAccountName) ? storageAccountName : '${abbrs.storageStorageAccounts}${resourceToken}'
    location: storageResourceGroupLocation
    tags: tags
    publicNetworkAccess: 'Enabled'
    sku: {
      name: storageSkuName
    }
    deleteRetentionPolicy: {
      enabled: true
      days: 2
    }
    containers: [
      {
        name: storageContainerName
        publicAccess: 'None'
      }
    ]
  }
}

// USER ROLES
module openAiRoleUser 'core/security/role.bicep' = if (!isContinuousDeployment) {
  scope: openAiResourceGroup
  name: 'openai-role-user'
  params: {
    principalId: principalId
    // Cognitive Services OpenAI User
    roleDefinitionId: '5e0bd9bd-7b93-4f28-af87-19fc36ad61bd'
    principalType: 'User'
  }
}

module storageContribRoleUser 'core/security/role.bicep' = if (!isContinuousDeployment) {
  scope: storageResourceGroup
  name: 'storage-contribrole-user'
  params: {
    principalId: principalId
    // Storage Blob Data Contributor
    roleDefinitionId: 'ba92f5b4-2d11-453d-a403-e96b0029c9fe'
    principalType: 'User'
  }
}

module searchContribRoleUser 'core/security/role.bicep' = if (!isContinuousDeployment) {
  scope: searchServiceResourceGroup
  name: 'search-contrib-role-user'
  params: {
    principalId: principalId
    // Search Index Data Contributor
    roleDefinitionId: '8ebe5a00-799e-43f5-93ac-243d3dce84a7'
    principalType: 'User'
  }
}

module searchSvcContribRoleUser 'core/security/role.bicep' = if (!isContinuousDeployment) {
  scope: searchServiceResourceGroup
  name: 'search-svccontrib-role-user'
  params: {
    principalId: principalId
    // Search Service Contributor
    roleDefinitionId: '7ca78c08-252a-4471-8644-bb5ff32d4ba0'
    principalType: 'User'
  }
}

// SYSTEM IDENTITIES
module openAiRoleSearchApi 'core/security/role.bicep' = {
  scope: openAiResourceGroup
  name: 'openai-role-searchapi'
  params: {
    principalId: searchApi.outputs.identityPrincipalId
    // Cognitive Services OpenAI User
    roleDefinitionId: '5e0bd9bd-7b93-4f28-af87-19fc36ad61bd'
    principalType: 'ServicePrincipal'
  }
}

module storageRoleSearchApi 'core/security/role.bicep' = {
  scope: storageResourceGroup
  name: 'storage-role-searchapi'
  params: {
    principalId: searchApi.outputs.identityPrincipalId
    // Storage Blob Data Reader
    roleDefinitionId: '2a2b9908-6ea1-4ae2-8e65-a410df84e7d1'
    principalType: 'ServicePrincipal'
  }
}

module searchRoleSearchApi 'core/security/role.bicep' = {
  scope: searchServiceResourceGroup
  name: 'search-role-searchapi'
  params: {
    principalId: searchApi.outputs.identityPrincipalId
    // Search Index Data Reader
    roleDefinitionId: '1407120a-92aa-4202-b7e9-c0e197c71c8f'
    principalType: 'ServicePrincipal'
  }
}

module openAiRoleIndexerApi 'core/security/role.bicep' = {
  scope: openAiResourceGroup
  name: 'openai-role-indexer'
  params: {
    principalId: indexerApi.outputs.identityPrincipalId
    // Cognitive Services OpenAI User
    roleDefinitionId: '5e0bd9bd-7b93-4f28-af87-19fc36ad61bd'
    principalType: 'ServicePrincipal'
  }
}

module storageContribRoleIndexerApi 'core/security/role.bicep' = {
  scope: storageResourceGroup
  name: 'storage-contribrole-indexer'
  params: {
    principalId: indexerApi.outputs.identityPrincipalId
    // Storage Blob Data Contributor
    roleDefinitionId: 'ba92f5b4-2d11-453d-a403-e96b0029c9fe'
    principalType: 'ServicePrincipal'
  }
}

module searchContribRoleIndexerApi 'core/security/role.bicep' = {
  scope: searchServiceResourceGroup
  name: 'search-contrib-role-indexer'
  params: {
    principalId: indexerApi.outputs.identityPrincipalId
    // Search Index Data Contributor
    roleDefinitionId: '8ebe5a00-799e-43f5-93ac-243d3dce84a7'
    principalType: 'ServicePrincipal'
  }
}

module searchSvcContribRoleIndexerApi 'core/security/role.bicep' = {
  scope: searchServiceResourceGroup
  name: 'search-svccontrib-role-indexer'
  params: {
    principalId: indexerApi.outputs.identityPrincipalId
    // Search Service Contributor
    roleDefinitionId: '7ca78c08-252a-4471-8644-bb5ff32d4ba0'
    principalType: 'ServicePrincipal'
  }
}

output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
output AZURE_RESOURCE_GROUP string = resourceGroup.name

output AZURE_CONTAINER_REGISTRY_ENDPOINT string = containerApps.outputs.registryLoginServer
output AZURE_CONTAINER_REGISTRY_NAME string = containerApps.outputs.registryName

output AZURE_OPENAI_SERVICE string = openAi.outputs.name
output AZURE_OPENAI_RESOURCE_GROUP string = openAiResourceGroup.name
output AZURE_OPENAI_CHATGPT_DEPLOYMENT string = chatGptDeploymentName
output AZURE_OPENAI_CHATGPT_MODEL string = chatGptModelName
output AZURE_OPENAI_EMBEDDING_DEPLOYMENT string = embeddingDeploymentName
output AZURE_OPENAI_EMBEDDING_MODEL string = embeddingModelName

output AZURE_SEARCH_INDEX string = searchIndexName
output AZURE_SEARCH_SERVICE string = searchService.outputs.name
output AZURE_SEARCH_SERVICE_RESOURCE_GROUP string = searchServiceResourceGroup.name
output AZURE_SEARCH_SEMANTIC_RANKER string = searchServiceSkuName == 'standard' ? 'enabled' : 'disabled'

output AZURE_STORAGE_ACCOUNT string = storage.outputs.name
output AZURE_STORAGE_CONTAINER string = storageContainerName
output AZURE_STORAGE_RESOURCE_GROUP string = storageResourceGroup.name

output WEBAPP_URI string = webApp.outputs.uri
output SEARCH_API_URI string = searchApi.outputs.uri
output INDEXER_API_URI string = indexerApi.outputs.uri

output ALLOWED_ORIGINS string = join(allowedOrigins, ',')
output BACKEND_URI string = !empty(backendUri) ? backendUri : searchApi.outputs.uri

output INDEXER_PRINCIPAL_ID string = indexerApi.outputs.identityPrincipalId
output SEARCH_API_PRINCIPAL_ID string = searchApi.outputs.identityPrincipalId
