#!/bin/bash
echo "1. Creating RFQ"
curl -s -X POST http://localhost:3000/api/rfq \
-H "Content-Type: application/json" \
-d '{
  "rfqId": "RFQ-TEST-01",
  "name": "Test Logistics Auction",
  "startTime": "2024-01-01T00:00:00.000Z",
  "bidCloseTime": "2026-12-31T00:00:00.000Z",
  "forcedCloseTime": "2026-12-31T01:00:00.000Z",
  "pickupDate": "2024-05-01T10:00:00.000Z",
  "triggerWindow": 2,
  "extensionDuration": 5,
  "extensionType": "ANY_BID"
}' > rfq_response.json

cat rfq_response.json
echo ""

# Extract Object ID
RFQ_OID=$(grep -o '"_id":"[^"]*' rfq_response.json | grep -o '[^"]*$')

echo "2. Placing Bid"
curl -s -X POST http://localhost:3000/api/bid \
-H "Content-Type: application/json" \
-d '{
  "rfqId": "'$RFQ_OID'",
  "supplierName": "Speedy Freight",
  "freightCharges": 1000,
  "originCharges": 200,
  "destinationCharges": 300,
  "transitTime": 3,
  "validity": "2026-12-31T00:00:00.000Z"
}' > bid_response.json

cat bid_response.json
echo ""

echo "3. Fetching Bids for RFQ"
curl -s http://localhost:3000/api/bid/$RFQ_OID
echo ""

echo "4. Fetching Activity Logs"
curl -s http://localhost:3000/api/activity/$RFQ_OID
echo ""

