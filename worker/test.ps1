$response = Invoke-WebRequest `
  -Uri "https://japan-map-ai.9dk9jptv8h.workers.dev" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"messages":[{"role":"user","content":"hello"}]}'

Write-Host $response.Content
