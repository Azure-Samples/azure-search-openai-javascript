#!/usr/bin/env bash

output=$(azd env get-values)

while IFS= read -r line; do
  name=$(echo "$line" | cut -d '=' -f 1)
  value=$(echo "$line" | cut -d '=' -f 2 | sed 's/^\"//;s/\"$//')
  export "$name"="$value"
done <<< "$output"

echo "Environment variables set."

roles=(
    "5e0bd9bd-7b93-4f28-af87-19fc36ad61bd"
    "ba92f5b4-2d11-453d-a403-e96b0029c9fe"
    "8ebe5a00-799e-43f5-93ac-243d3dce84a7"
)

if [ -z "$AZURE_RESOURCE_GROUP" ]; then
    export AZURE_RESOURCE_GROUP="rg-$AZURE_ENV_NAME"
    azd env set AZURE_RESOURCE_GROUP "$AZURE_RESOURCE_GROUP"
fi

for role in "${roles[@]}"; do
    az role assignment create \
        --role "$role" \
        --assignee-object-id "$AZURE_PRINCIPAL_ID" \
        --scope /subscriptions/"$AZURE_SUBSCRIPTION_ID"/resourceGroups/"$AZURE_RESOURCE_GROUP" \
        --assignee-principal-type User
done
