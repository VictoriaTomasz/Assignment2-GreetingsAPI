# Greeting API Documentation

## URL for accessing the API Endpoint
**URL**: `http://localhost:3000/api/greet`

## valid JSON response from Greet endpoint when a valid GreetingRequest is made.
```json
Request body:
{
  "timeOfDay": "Morning",
  "language": "English",
  "tone": "Formal"
}

Response body:
{
  "greetingMessage": "Good morning"
}