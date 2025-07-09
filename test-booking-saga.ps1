# Test Booking Saga Flow
# This script tests the complete booking saga with outbox pattern

Write-Host "🧪 Testing Booking Saga Flow with Outbox Pattern" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Yellow
Write-Host "📢 Using Backoffice BFF as API Gateway to Booking Service" -ForegroundColor Yellow

# API endpoints
$BACKOFFICE_BFF_URL = "http://localhost:8080"
$BOOKING_API_PATH = "/api/booking-service/bookings"

# Direct service endpoint (fallback if BFF doesn't work)
$DIRECT_BOOKING_URL = "http://localhost:8093"
$USE_DIRECT_ENDPOINT = $true  # Set to true to use direct endpoint, false to use BFF

# Keycloak settings
$KEYCLOAK_URL = "http://localhost:9090"
$KEYCLOAK_REALM = "BookingSmart"
$KEYCLOAK_TOKEN_ENDPOINT = "$KEYCLOAK_URL/realms/$KEYCLOAK_REALM/protocol/openid-connect/token"

# Client and user credentials
$CLIENT_ID = "backoffice-bff"
$CLIENT_SECRET = "qhW4NC8pgPLdJDTd57sry5ON1fHK1d8i"
$USERNAME = "phamduyhuy"
$PASSWORD = "123456"

# Function to get a fresh access token from Keycloak
function Get-KeycloakToken {
    Write-Host "🔑 Getting fresh access token from Keycloak..." -ForegroundColor Cyan
    
    $tokenParams = @{
        grant_type    = "password"
        client_id     = $CLIENT_ID
        client_secret = $CLIENT_SECRET
        username      = $USERNAME
        password      = $PASSWORD
        scope         = "openid"
    }
    
    try {
        $tokenResponse = Invoke-RestMethod -Uri $KEYCLOAK_TOKEN_ENDPOINT -Method POST -Body $tokenParams -ContentType "application/x-www-form-urlencoded"
        
        Write-Host "✅ Successfully obtained access token" -ForegroundColor Green
        
        # Token details
        $expiry = (Get-Date).AddSeconds($tokenResponse.expires_in)
        Write-Host "   Token expires at: $expiry" -ForegroundColor Yellow
        Write-Host "   Token type: $($tokenResponse.token_type)" -ForegroundColor Yellow
        Write-Host "   Scope: $($tokenResponse.scope)" -ForegroundColor Yellow
        
        return $tokenResponse.access_token
    }
    catch {
        Write-Host "❌ Failed to obtain access token: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorContent = $reader.ReadToEnd()
            Write-Host "Error details: $errorContent" -ForegroundColor Red
        }
        exit 1
    }
}

# Get a fresh token
$JWT_TOKEN = Get-KeycloakToken

# Create headers with Authorization
$headers = @{
    "Authorization" = "Bearer $JWT_TOKEN"
    "Content-Type" = "application/json"
}

# Function to check if a service is available
function Test-ServiceAvailability {
    param (
        [string]$ServiceUrl,
        [string]$ServiceName
    )
    
    Write-Host "🔍 Checking if $ServiceName is available..." -ForegroundColor Yellow
    
    try {
        $healthCheck = Invoke-RestMethod -Uri "$ServiceUrl/actuator/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
        if ($healthCheck.status -eq "UP") {
            Write-Host "✅ $ServiceName is running and healthy!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⚠️ $ServiceName health check returned status: $($healthCheck.status)" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "❌ $ServiceName is not available: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Select the appropriate endpoint to use
$ENDPOINT_URL = if ($USE_DIRECT_ENDPOINT) { $DIRECT_BOOKING_URL } else { "$BACKOFFICE_BFF_URL$BOOKING_API_PATH" }

Write-Host "🔌 Using endpoint: $ENDPOINT_URL" -ForegroundColor Cyan

# Check if service is available
$serviceAvailable = Test-ServiceAvailability -ServiceUrl $(if ($USE_DIRECT_ENDPOINT) { $DIRECT_BOOKING_URL } else { $BACKOFFICE_BFF_URL }) -ServiceName $(if ($USE_DIRECT_ENDPOINT) { "Booking Service" } else { "Backoffice BFF" })
if (-not $serviceAvailable) {
    Write-Host "❌ Cannot proceed with testing. Service is not available." -ForegroundColor Red
    exit 1
}

# Test data for creating a booking
$bookingRequest = @{
    userId = "1c544260-57c6-4e63-ba65-9a529f3783a2"  # Use the user ID from the JWT token
    bookingType = "COMBO"
    totalAmount = 5000000
    currency = "VND"
    flightDetails = @{
        departureAirport = "SGN"
        arrivalAirport = "HAN"
        departureTime = "2025-08-01T08:00:00Z"
        returnTime = "2025-08-10T15:00:00Z"
        passengers = 2
    }
    hotelDetails = @{
        hotelId = "HT123456"
        roomType = "DELUXE"
        checkIn = "2025-08-01"
        checkOut = "2025-08-10"
        guests = 2
    }
    contactInformation = @{
        fullName = "Huy Pham"
        email = "huypd.dev@gmail.com"
        phone = "+84901234567"
    }
} | ConvertTo-Json -Depth 5

Write-Host "📝 Creating test booking..." -ForegroundColor Cyan
Write-Host "Request payload:" -ForegroundColor Yellow
Write-Host $bookingRequest

try {
    # Create a booking using the selected endpoint
    $response = Invoke-RestMethod -Uri "$ENDPOINT_URL/bookings" `
        -Method POST `
        -Headers $headers `
        -Body $bookingRequest

    Write-Host "✅ Booking created successfully!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    Write-Host ($response | ConvertTo-Json -Depth 3)

    $bookingId = $response.bookingId
    
    Write-Host ""
    Write-Host "🔍 Monitoring saga progress..." -ForegroundColor Cyan
    Write-Host "Booking ID: $bookingId" -ForegroundColor Yellow
    
    # Monitor the booking status for 30 seconds
    for ($i = 1; $i -le 6; $i++) {
        Start-Sleep -Seconds 5
        
        try {
            $statusResponse = Invoke-RestMethod -Uri "$ENDPOINT_URL/bookings/$bookingId" -Method GET -Headers $headers
            Write-Host "📊 Status check $i`: Status = $($statusResponse.status), Saga State = $($statusResponse.sagaState)" -ForegroundColor Yellow
            
            if ($statusResponse.status -eq "CONFIRMED" -or $statusResponse.status -eq "FAILED") {
                Write-Host "🎉 Final status reached: $($statusResponse.status)" -ForegroundColor Green
                break
            }
        }
        catch {
            Write-Host "⚠️  Could not check booking status: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }

} catch {
    Write-Host "❌ Failed to create booking: $($_.Exception.Message)" -ForegroundColor Red
    try {
        if ($_.ErrorDetails.Message) {
            Write-Host "Error details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    } catch {
        Write-Host "Could not extract detailed error information" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📈 Check Kafka topics and messages:" -ForegroundColor Cyan
Write-Host "   Kafka UI: http://localhost:8090" -ForegroundColor Yellow
Write-Host "   Look for topics: booking.flight-events, booking.hotel-events, booking.payment-events" -ForegroundColor Yellow

# Display saga completion message if we have a booking ID
if (-not [string]::IsNullOrEmpty($bookingId)) {
    Write-Host ""
    Write-Host "🎯 Check if saga completed successfully by verifying:" -ForegroundColor Green
    Write-Host "1. Booking status in database" -ForegroundColor Yellow
    Write-Host "2. Events in Kafka topics" -ForegroundColor Yellow
    Write-Host "3. Outbox table entries" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "🔍 Debug Information:" -ForegroundColor Magenta
Write-Host "1. Verify connector statuses:" -ForegroundColor Cyan
Write-Host "   curl http://localhost:8083/connectors | jq" -ForegroundColor DarkCyan
Write-Host ""
Write-Host "2. Check consumer groups:" -ForegroundColor Cyan
Write-Host "   curl http://localhost:8083/admin/consumer-groups | jq" -ForegroundColor DarkCyan
Write-Host ""
Write-Host "3. To check database outbox tables:" -ForegroundColor Cyan
Write-Host "   - booking_outbox: Messages from Booking Service" -ForegroundColor DarkCyan
Write-Host "   - flight_events: Messages from Flight Service" -ForegroundColor DarkCyan
Write-Host "   - hotel_events: Messages from Hotel Service" -ForegroundColor DarkCyan
Write-Host "   - payment_events: Messages from Payment Service" -ForegroundColor DarkCyan
Write-Host ""
Write-Host "4. SQL queries to check outbox tables:" -ForegroundColor Cyan
Write-Host "   SELECT * FROM booking_outbox ORDER BY id DESC LIMIT 10;" -ForegroundColor DarkCyan
Write-Host "   SELECT * FROM flight_events ORDER BY id DESC LIMIT 10;" -ForegroundColor DarkCyan
Write-Host "   SELECT * FROM hotel_events ORDER BY id DESC LIMIT 10;" -ForegroundColor DarkCyan
Write-Host "   SELECT * FROM payment_events ORDER BY id DESC LIMIT 10;" -ForegroundColor DarkCyan
Write-Host ""
Write-Host "5. Manual Keycloak Token Request (curl):" -ForegroundColor Cyan
Write-Host "   curl -X POST '$KEYCLOAK_TOKEN_ENDPOINT' \\" -ForegroundColor DarkCyan
Write-Host "     --data-urlencode 'grant_type=password' \\" -ForegroundColor DarkCyan
Write-Host "     --data-urlencode 'client_id=$CLIENT_ID' \\" -ForegroundColor DarkCyan
Write-Host "     --data-urlencode 'client_secret=$CLIENT_SECRET' \\" -ForegroundColor DarkCyan
Write-Host "     --data-urlencode 'username=$USERNAME' \\" -ForegroundColor DarkCyan
Write-Host "     --data-urlencode 'password=$PASSWORD' \\" -ForegroundColor DarkCyan
Write-Host "     --data-urlencode 'scope=openid'" -ForegroundColor DarkCyan
