#!/bin/bash

echo "Testing Nginx API Gateway..."

# Test root endpoint
echo "1. Testing root endpoint:"
curl -s http://localhost:8080/ | jq .

echo -e "\n2. Testing health endpoint:"
curl -s http://localhost:8080/health | jq .

echo -e "\n3. Testing nginx health endpoint:"
curl -s http://localhost:8090/nginx-health

echo -e "\n4. Testing legacy users endpoint:"
curl -s http://localhost:8080/users | jq .

echo -e "\n5. Testing 404 endpoint:"
curl -s http://localhost:8080/nonexistent | jq .

echo -e "\n6. Testing user service proxy (if user service is running):"
curl -s http://localhost:8080/api/v1/users | jq . || echo "User service not available"

echo -e "\nGateway tests completed!"