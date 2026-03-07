# Start STYLE GLAMOUR BEATS server + AI in one command
# Usage examples:
#   Run rule-based AI (no keys):
#     PowerShell -ExecutionPolicy Bypass -File .\scripts\start-all.ps1
#   Run with OpenAI:
#     PowerShell -ExecutionPolicy Bypass -File .\scripts\start-all.ps1 -AiProvider openai -OpenAiKey "YOUR_OPENAI_KEY" -OpenAiModel "gpt-4o-mini"
#   Run with Gemini:
#     PowerShell -ExecutionPolicy Bypass -File .\scripts\start-all.ps1 -AiProvider gemini -GeminiKey "YOUR_GEMINI_KEY" -GeminiModel "gemini-1.5-flash"

param(
  [ValidateSet('rule-based','openai','gemini')]
  [string]$AiProvider = 'rule-based',
  [string]$OpenAiKey = '',
  [string]$OpenAiModel = 'gpt-4o-mini',
  [string]$GeminiKey = '',
  [string]$GeminiModel = 'gemini-1.5-flash',
  [switch]$EnableFirebase,
  [string]$FirebaseCredsPath = '',
  [string]$FirebaseCollections = '*',
  [switch]$ImportData,
  [switch]$SyncDelete
)

# Move to project root (script is under SGB_Shop/scripts)
$ProjectRoot = Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $ProjectRoot

# Stop any running node processes to avoid EADDRINUSE
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Configure AI provider
switch ($AiProvider) {
  'openai' {
    $env:AI_PROVIDER = 'openai'
    if ($OpenAiKey) { $env:OPENAI_API_KEY = $OpenAiKey }
    if ($OpenAiModel) { $env:OPENAI_MODEL = $OpenAiModel }
  }
  'gemini' {
    $env:AI_PROVIDER = 'gemini'
    if ($GeminiKey) { $env:GEMINI_API_KEY = $GeminiKey }
    if ($GeminiModel) { $env:GEMINI_MODEL = $GeminiModel }
  }
  default {
    # rule-based fallback (do not set provider env, server will auto fallback)
    Remove-Item Env:AI_PROVIDER -ErrorAction SilentlyContinue
    Remove-Item Env:OPENAI_API_KEY -ErrorAction SilentlyContinue
    Remove-Item Env:GEMINI_API_KEY -ErrorAction SilentlyContinue
  }
}

# Configure Firebase (optional)
if (-not $FirebaseCredsPath) {
  $candidate1 = Join-Path $PSScriptRoot 'firebase-service-account.json'
  $candidate2 = Join-Path $ProjectRoot 'firebase.json'
  if (Test-Path -LiteralPath $candidate1) { $FirebaseCredsPath = $candidate1 }
  elseif (Test-Path -LiteralPath $candidate2) { $FirebaseCredsPath = $candidate2 }
}

# Force host/port to 3001 for local web
$env:HOST = '127.0.0.1'
$env:PORT = '3001'
$ServerUrl = "http://$($env:HOST):$($env:PORT)"

if ($EnableFirebase -or $ImportData -or $FirebaseCredsPath) {
  $env:FIREBASE_ENABLED = 'true'
  if ($FirebaseCollections) { $env:FIREBASE_COLLECTIONS = $FirebaseCollections }
  if ($FirebaseCredsPath) {
    # Prefer GOOGLE_APPLICATION_CREDENTIALS, fallback to FIREBASE_CREDENTIALS
    $env:GOOGLE_APPLICATION_CREDENTIALS = $FirebaseCredsPath
    $env:FIREBASE_CREDENTIALS = $FirebaseCredsPath
  }
  if (-not $EnableFirebase) { $EnableFirebase = $true }
}

# Import local JSON data to Firestore if requested
if ($ImportData -or ($EnableFirebase -and $FirebaseCredsPath)) {
  Write-Host "Importing local JSON data to Firestore..." -ForegroundColor Yellow
  $syncArg = if ($SyncDelete) { '--sync' } else { '' }
  $collectionArg = if ($FirebaseCollections) { @('--collections', $FirebaseCollections) } else { @() }
  node scripts\import-to-firestore.js $syncArg @collectionArg
}

# Warm-up AI + open browser once server is ready
$warmupPayload = @{
  profile = @{
    gender = 'unisex'
    budget = 'mid'
    climate = 'temperate'
    colors = @('den')
  }
  chatHistory = @()
} | ConvertTo-Json -Depth 6

Start-Job -ScriptBlock {
  param($Url, $Payload)
  $max = 30
  for($i=0; $i -lt $max; $i++){
    try{
      Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2 | Out-Null
      break
    }catch{
      Start-Sleep -Seconds 1
    }
  }
  try{ Start-Process -FilePath ($Url + '/auth.html?force=1') | Out-Null }catch{ }
  try{
    Invoke-RestMethod -Method Post -Uri ($Url + '/api/style-advisor') -Body $Payload -ContentType "application/json" -TimeoutSec 10 | Out-Null
  }catch{ }
} -ArgumentList $ServerUrl, $warmupPayload | Out-Null

# Start the Node server
Write-Host "Starting SGB server on $ServerUrl ..." -ForegroundColor Cyan
node server.js
# http://localhost:3001/auth.html