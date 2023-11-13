metadata description = 'Creates an Application Insights instance and a Log Analytics workspace.'
param logAnalyticsName string
param applicationInsightsName string
param applicationInsightsDashboardName string
param location string = resourceGroup().location
param tags object = {}
param includeDashboard bool = true

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
    dashboardName: applicationInsightsDashboardName
    includeDashboard: includeDashboard
    logAnalyticsWorkspaceId: logAnalytics.outputs.id
  }
}

output applicationInsightsConnectionString string = useApplicationInsights ? applicationInsights.outputs.connectionString : ''
output applicationInsightsInstrumentationKey string = useApplicationInsights ? applicationInsights.outputs.instrumentationKey : ''
output applicationInsightsName string = useApplicationInsights ? applicationInsights.outputs.name : ''
output logAnalyticsWorkspaceId string = logAnalytics.outputs.id
output logAnalyticsWorkspaceName string = logAnalytics.outputs.name
