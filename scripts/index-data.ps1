$scriptPath = $MyInvocation.MyCommand.Path
cd $scriptPath/../..

Write-Host "Loading azd .env file from current environment"

azd env get-values > .env
$output = type .env

foreach ($line in $output) {
  if (!$line.Contains('=')) {
    continue
  }

  $name, $value = $line.Split("=")
  $value = $value -replace '^\"|\"$'
  [Environment]::SetEnvironmentVariable($name, $value)
}

Write-Host 'Installing dependencies'
npm ci

Write-Host 'Running "prepdocs.py"'
npx index-files --wait --indexer-url $env:INDEXER_API_URI ./data/*.md
