param logAnalyticsName string
param applicationInsightsName string
param location string = resourceGroup().location
param tags object = {}

var useApplicationInsights = !empty(applicationInsightsName)

module logAnalytics 'loganalytics.bicep' = {
  name: 'loganalytics'
  params: {
    name: logAnalyticsName
    location: location
    tags: tags
  }
}

module applicationInsights 'applicationinsights.bicep' = if (useApplicationInsights) {
  name: 'applicationinsights'
  params: {
    name: applicationInsightsName
    location: location
    tags: tags
  }
}

output applicationInsightsConnectionString string =  useApplicationInsights ? applicationInsights.outputs.connectionString : ''
output applicationInsightsInstrumentationKey string = useApplicationInsights ? applicationInsights.outputs.instrumentationKey : ''
output applicationInsightsName string = useApplicationInsights ? applicationInsights.outputs.name : ''
output logAnalyticsWorkspaceName string = logAnalytics.outputs.name
