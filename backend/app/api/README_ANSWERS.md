# Answers Library API

This module provides the RESTful API endpoints for managing the answers library in the Summit Security Questionnaire application.

## Overview

The Answers Library allows users to:

- Create and save question-answer pairs manually
- Import answers from processed questionnaires
- View, update, and delete saved answers
- Search and filter through the answer library

## Endpoints

### GET /api/answers/

Retrieve all answers from the library.

**Response:**

```json
{
  "success": true,
  "answers": [
    {
      "id": "uuid",
      "question": "Question text",
      "answer": "Answer text",
      "source_type": "user",
      "source_name": "Current User",
      "created_at": "2025-10-06T10:00:00Z",
      "updated_at": "2025-10-06T10:00:00Z"
    }
  ],
  "count": 1
}
```

### POST /api/answers/

Create a new answer in the library.

**Request Body:**

```json
{
  "question": "What is your data retention policy?",
  "answer": "We retain data for 7 years..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Answer created successfully",
  "answer": {
    "id": "uuid",
    "question": "What is your data retention policy?",
    "answer": "We retain data for 7 years...",
    "source_type": "user",
    "source_name": "Current User",
    "created_at": "2025-10-06T10:00:00Z",
    "updated_at": "2025-10-06T10:00:00Z"
  }
}
```

### GET /api/answers/{answer_id}

Retrieve a specific answer by ID.

**Response:**

```json
{
  "success": true,
  "answer": {
    "id": "uuid",
    "question": "Question text",
    "answer": "Answer text",
    "source_type": "user",
    "source_name": "Current User",
    "created_at": "2025-10-06T10:00:00Z",
    "updated_at": "2025-10-06T10:00:00Z"
  }
}
```

### PUT /api/answers/{answer_id}

Update an existing answer.

**Request Body:**

```json
{
  "question": "Updated question text",
  "answer": "Updated answer text"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Answer updated successfully",
  "answer": {
    "id": "uuid",
    "question": "Updated question text",
    "answer": "Updated answer text",
    "source_type": "user",
    "source_name": "Current User",
    "created_at": "2025-10-06T10:00:00Z",
    "updated_at": "2025-10-06T10:30:00Z"
  }
}
```

### DELETE /api/answers/{answer_id}

Delete an answer from the library.

**Response:**

```json
{
  "success": true,
  "message": "Answer deleted successfully",
  "answer_id": "uuid"
}
```

## Error Handling

All endpoints return appropriate HTTP status codes and error messages:

- `400 Bad Request` - Invalid input or missing required fields
- `404 Not Found` - Answer not found
- `500 Internal Server Error` - Server-side error

**Error Response Format:**

```json
{
  "detail": "Error message here"
}
```

## Database Schema

The answers are stored in the `answers` table with the following structure:

```sql
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('user', 'questionnaire')),
  source_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Usage Examples

### Creating an Answer (cURL)

```bash
curl -X POST http://localhost:8000/api/answers/ \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Do you have a physical office?",
    "answer": "Yes, we have offices in multiple locations."
  }'
```

### Fetching All Answers (cURL)

```bash
curl http://localhost:8000/api/answers/
```

### Updating an Answer (cURL)

```bash
curl -X PUT http://localhost:8000/api/answers/{answer_id} \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Do you have physical offices?",
    "answer": "Yes, we have offices in 3 major cities."
  }'
```

### Deleting an Answer (cURL)

```bash
curl -X DELETE http://localhost:8000/api/answers/{answer_id}
```

## Related Files

- **API Routes**: `backend/app/api/answers.py`
- **Database Service**: `backend/app/services/database.py`
- **Database Schema**: `backend/database_schema_answers.sql`
- **Frontend Component**: `frontend/src/components/AnswersLibrary.tsx`
- **API Client**: `frontend/src/lib/api.ts`

## Future Enhancements

- [ ] Add search and filtering capabilities
- [ ] Implement bulk operations (import/export)
- [ ] Add tagging and categorization
- [ ] Support for rich text formatting in answers
- [ ] Version history for answers
- [ ] User authentication and ownership tracking
