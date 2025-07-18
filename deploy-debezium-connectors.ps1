# Deploy Debezium Connectors Script (PowerShell)
# Usage: .\deploy-debezium-connectors.ps1

$CONNECT_URL = "http://localhost:8083"
$DEBEZIUM_DIR = ".\debezium"

Write-Host "🚀 Deploying Debezium Connectors..." -ForegroundColor Green
Write-Host "Connect URL: $CONNECT_URL" -ForegroundColor Yellow
Write-Host "========================================"

# Function to deploy a connector
function Deploy-Connector {
    param(
        [string]$ConnectorFile
    )
    
    $ConnectorName = [System.IO.Path]::GetFileNameWithoutExtension($ConnectorFile)
    Write-Host "📤 Deploying connector: $ConnectorName" -ForegroundColor Cyan
    
    try {
        # Read the connector file and extract only the config part
        $ConnectorJson = Get-Content $ConnectorFile -Raw | ConvertFrom-Json
        $ConfigJson = $ConnectorJson.config | ConvertTo-Json -Depth 10
        
        # Use PUT request for connector deployment with only the config
        $Response = Invoke-RestMethod -Uri "$CONNECT_URL/connectors/$ConnectorName/config" `
            -Method PUT `
            -ContentType "application/json" `
            -Body $ConfigJson `
            -ErrorAction Stop
        
        Write-Host "✅ Successfully deployed: $ConnectorName" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Failed to deploy: $ConnectorName" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        
        # Try to get more detailed error information
        try {
            $ErrorResponse = $_.Exception.Response
            if ($ErrorResponse) {
                $ErrorStream = $ErrorResponse.GetResponseStream()
                $Reader = New-Object System.IO.StreamReader($ErrorStream)
                $ErrorContent = $Reader.ReadToEnd()
                $Reader.Close()
                $ErrorStream.Close()
                
                Write-Host "   Detailed error:" -ForegroundColor Red
                Write-Host "   $ErrorContent" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "   Could not retrieve detailed error information" -ForegroundColor Yellow
        }
        
        return $false
    }
    Write-Host ""
}

# Function to wait for Kafka Connect to be ready
function Wait-ForConnect {
    Write-Host "⏳ Waiting for Kafka Connect to be ready..." -ForegroundColor Yellow
    
    for ($i = 1; $i -le 30; $i++) {
        try {
            $Response = Invoke-RestMethod -Uri "$CONNECT_URL/connectors" -Method GET -ErrorAction Stop
            Write-Host "✅ Kafka Connect is ready!" -ForegroundColor Green
            return $true
        }
        catch {
            Write-Host "   Attempt $i/30 - Kafka Connect not ready yet..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
    }
    
    Write-Host "❌ Kafka Connect failed to start within 150 seconds" -ForegroundColor Red
    exit 1
}

# Function to check if database exists and is accessible
function Test-DatabaseConnection {
    param(
        [string]$Database,
        [string]$Table = $null
    )
    
    Write-Host "🔍 Checking database connection: $Database" -ForegroundColor Yellow
    
    try {
        # Test basic database connectivity using docker exec
        $TestResult = docker exec bookingsmart-postgres-1 psql -U postgres -d $Database -c "\dt" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database $Database is accessible" -ForegroundColor Green
            
            # If table is specified, check if it exists
            if ($Table) {
                $TableCheck = docker exec bookingsmart-postgres-1 psql -U postgres -d $Database -c "\d $Table" 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ Table $Table exists in $Database" -ForegroundColor Green
                    return $true
                } else {
                    Write-Host "❌ Table $Table does not exist in $Database" -ForegroundColor Red
                    Write-Host "   You may need to start the $Database service to create the schema" -ForegroundColor Yellow
                    return $false
                }
            }
            return $true
        } else {
            Write-Host "❌ Cannot connect to database $Database" -ForegroundColor Red
            Write-Host "   Error: $TestResult" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ Error checking database $Database`: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main deployment process
function Main {
    Wait-ForConnect
    
    Write-Host "🔧 Pre-deployment checks..." -ForegroundColor Yellow
    
    # Check database connections and required tables (updated for service-specific outbox tables)
    $DatabaseChecks = @(
        @{ Database = "booking_db"; Table = "booking_outbox_events" },
        @{ Database = "flight_db"; Table = "flight_outbox_events" },
        @{ Database = "hotel_db"; Table = "hotel_outbox_events" },
        @{ Database = "payment_db"; Table = "payment_outbox_events" },
        @{ Database = "notification_db"; Table = "notification_outbox_events" }
    )
    
    $AllDatabasesReady = $true
    foreach ($Check in $DatabaseChecks) {
        $Result = Test-DatabaseConnection -Database $Check.Database -Table $Check.Table
        $AllDatabasesReady = $AllDatabasesReady -and $Result
    }
    
    if (-not $AllDatabasesReady) {
        Write-Host ""
        Write-Host "⚠️  Some databases or tables are not ready. Proceeding anyway..." -ForegroundColor Yellow
        Write-Host "   Make sure the corresponding services have been started and migrations have run." -ForegroundColor Yellow
        Write-Host ""
    }
    
    Write-Host "🔧 Deploying connectors from: $DEBEZIUM_DIR" -ForegroundColor Yellow
    
    $Success = $true
    $Success = $Success -and (Deploy-Connector "$DEBEZIUM_DIR\booking-saga-outbox-connector.json")
    $Success = $Success -and (Deploy-Connector "$DEBEZIUM_DIR\flight-db-connector.json")
    $Success = $Success -and (Deploy-Connector "$DEBEZIUM_DIR\hotel-db-connector.json")
    $Success = $Success -and (Deploy-Connector "$DEBEZIUM_DIR\payment-db-connector.json")
    $Success = $Success -and (Deploy-Connector "$DEBEZIUM_DIR\notification-db-connector.json")
    
    if ($Success) {
        Write-Host "========================================"
        Write-Host "🎉 All connectors deployed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Check connector status:" -ForegroundColor Yellow
        Write-Host "   curl $CONNECT_URL/connectors"
        Write-Host ""
        Write-Host "🔍 Monitor Kafka topics:" -ForegroundColor Yellow
        Write-Host "   Kafka UI: http://localhost:8090"
        Write-Host "   Connect API: $CONNECT_URL"
    } else {
        Write-Host "❌ Some connectors failed to deploy. Check the logs above." -ForegroundColor Red
        exit 1
    }
}

Main