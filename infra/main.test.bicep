// This file is for doing static analysis and contains sensible defaults
// for PSRule to minimise false-positives and provide the best results.

// This file is not intended to be used as a runtime configuration file.

targetScope = 'subscription'

param location string = 'eastus2'

module test 'main.bicep' = {
  name: 'test'
  params: {
    location: location
    allowedOrigin: ''
    chatGptDeploymentName: 'na'
    chatGptModelName: 'test'
    chatGptModelVersion: '603'
    environmentName: 'test'
    openAiResourceGroupLocation: location
    searchIndexName: 'test'
    searchServiceSkuName: 'standard'
    storageSkuName: 'Standard_LRS'
    webAppLocation: location
  }
}
