$ErrorActionPreference = "Continue"

Write-Host "`n=== 1. REGISTER ===" -ForegroundColor Cyan
$registerBody = @{
    email = "test@reeltune.com"
    password = "Test1234!"
    name = "Test"
} | ConvertTo-Json

try {
    $registerResult = Invoke-RestMethod -Method POST `
        -Uri "http://localhost:3000/api/v1/auth/register" `
        -Body $registerBody `
        -ContentType "application/json"
    Write-Host "Status: 201 OK" -ForegroundColor Green
    $registerResult | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    $_.ErrorDetails.Message
}

Write-Host "`n=== 2. LOGIN ===" -ForegroundColor Cyan
$loginBody = @{
    email = "test@reeltune.com"
    password = "Test1234!"
} | ConvertTo-Json

try {
    $loginResult = Invoke-RestMethod -Method POST `
        -Uri "http://localhost:3000/api/v1/auth/login" `
        -Body $loginBody `
        -ContentType "application/json"
    Write-Host "Status: 200 OK" -ForegroundColor Green
    $loginResult | ConvertTo-Json -Depth 10

    $token = $loginResult.accessToken
    Write-Host "`n=== 3. ME ===" -ForegroundColor Cyan
    $meResult = Invoke-RestMethod -Method GET `
        -Uri "http://localhost:3000/api/v1/auth/me" `
        -Headers @{ Authorization = "Bearer $token" }
    Write-Host "Status: 200 OK" -ForegroundColor Green
    $meResult | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    $_.ErrorDetails.Message
}
