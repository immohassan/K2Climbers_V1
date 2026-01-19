# Supabase Connection Fix Script
# This script helps you set up the correct Supabase connection string

Write-Host "=== Supabase Connection Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item .env.example .env -ErrorAction SilentlyContinue
}

Write-Host "Please enter your Supabase database password:" -ForegroundColor Yellow
$password = Read-Host -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

Write-Host ""
Write-Host "Choose connection method:" -ForegroundColor Yellow
Write-Host "1. Direct connection with SSL (Recommended)"
Write-Host "2. Connection pooling"
Write-Host "3. Direct connection without SSL"
$choice = Read-Host "Enter choice (1-3)"

$projectRef = "aoomndjkzklvhwsxcsmv"
$dbUrl = ""

switch ($choice) {
    "1" {
        # Direct with SSL
        $dbUrl = "postgresql://postgres:$passwordPlain@db.$projectRef.supabase.co:5432/postgres?sslmode=require"
        Write-Host "Using: Direct connection with SSL" -ForegroundColor Green
    }
    "2" {
        # Connection pooling
        Write-Host "Enter your Supabase region (e.g., us-east-1):" -ForegroundColor Yellow
        $region = Read-Host
        $dbUrl = "postgresql://postgres.$projectRef:$passwordPlain@aws-0-$region.pooler.supabase.com:6543/postgres?pgbouncer=true"
        Write-Host "Using: Connection pooling" -ForegroundColor Green
    }
    "3" {
        # Direct without SSL
        $dbUrl = "postgresql://postgres:$passwordPlain@db.$projectRef.supabase.co:5432/postgres"
        Write-Host "Using: Direct connection without SSL" -ForegroundColor Yellow
    }
    default {
        Write-Host "Invalid choice. Using direct connection with SSL." -ForegroundColor Red
        $dbUrl = "postgresql://postgres:$passwordPlain@db.$projectRef.supabase.co:5432/postgres?sslmode=require"
    }
}

# Update .env file
$envContent = Get-Content .env -Raw -ErrorAction SilentlyContinue
if ($envContent) {
    # Replace existing DATABASE_URL
    if ($envContent -match 'DATABASE_URL="[^"]*"') {
        $envContent = $envContent -replace 'DATABASE_URL="[^"]*"', "DATABASE_URL=`"$dbUrl`""
    } else {
        # Add DATABASE_URL if it doesn't exist
        $envContent += "`nDATABASE_URL=`"$dbUrl`""
    }
    Set-Content .env -Value $envContent -NoNewline
    Write-Host ""
    Write-Host "✓ Updated .env file" -ForegroundColor Green
} else {
    # Create new .env file
    $newEnv = @"
DATABASE_URL="$dbUrl"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-this-to-a-random-secret"
NODE_ENV="development"
"@
    Set-Content .env -Value $newEnv
    Write-Host ""
    Write-Host "✓ Created .env file" -ForegroundColor Green
}

Write-Host ""
Write-Host "Testing connection..." -ForegroundColor Cyan
Write-Host "Run: npm run db:push" -ForegroundColor Yellow
