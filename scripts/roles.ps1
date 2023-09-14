$output = azd env get-values

foreach ($line in $output) {
  $name, $value = $line.Split("=")
  $value = $value -replace '^\"|\"$'
  [Environment]::SetEnvironmentVariable($name, $value)
}

Write-Host "Environment variables set."

$roles = @(
    "5e0bd9bd-7b93-4f28-af87-19fc36ad61bd",
    "ba92f5b4-2d11-453d-a403-e96b0029c9fe",
    "8ebe5a00-799e-43f5-93ac-243d3dce84a7"
)

if ([string]::IsNullOrEmpty($env:AZURE_RESOURCE_GROUP)) {
    $env:AZURE_RESOURCE_GROUP = "rg-$env:AZURE_ENV_NAME"
    azd env set AZURE_RESOURCE_GROUP $env:AZURE_RESOURCE_GROUP
}

foreach ($role in $roles) {
    az role assignment create `
        --role $role `
        --assignee-object-id $env:AZURE_PRINCIPAL_ID `
        --scope /subscriptions/$env:AZURE_SUBSCRIPTION_ID/resourceGroups/$env:AZURE_RESOURCE_GROUP `
        --assignee-principal-type User
}
