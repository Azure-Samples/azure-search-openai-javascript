$scriptPath = $MyInvocation.MyCommand.Path
cd $scriptPath/../..

Write-Host "Loading azd .env file from current environment"
$output = azd env get-values

foreach ($line in $output) {
  if (!$line.Contains('=')) {
    continue
  }

  $name, $value = $line.Split("=")
  $value = $value -replace '^\"|\"$'
  [Environment]::SetEnvironmentVariable($name, $value)
}

Write-Host 'Installing dependencies and building CLI'
npm ci
npm run build --workspace=indexer

Write-Host 'Running "index-files" CLI tool'
$files = Get-Item "data/*.*"
npx index-files --wait --indexer-url "$env:INDEXER_API_URI" --index-name "$env:AZURE_SEARCH_INDEX" $files
