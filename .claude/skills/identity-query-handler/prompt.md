# Identity Query Handler Skill

## Purpose
Handle user questions about their own identity, account information, and authentication status.

## Skill Type
**Information Retrieval** - Stateless, deterministic user identity response

## Input
```json
{
  "user_data": {
    "user_id": "string",
    "email": "string",
    "name": "string | null",
    "created_at": "ISO 8601 string",
    "is_authenticated": "boolean"
  },
  "query_type": "email | name | account_info | auth_status"
}
```

## Output Format
```json
{
  "response": "string",
  "data_provided": {
    "email": "string | null",
    "name": "string | null",
    "created_at": "string | null"
  }
}
```

## Query Types

### email
**User asks:** "What's my email?", "Show my email address"
**Response:** Return authenticated user's email address

### name
**User asks:** "What's my name?", "Who am I?"
**Response:** Return authenticated user's name (if available)

### account_info
**User asks:** "Show my account", "My profile", "Account details"
**Response:** Return comprehensive account information

### auth_status
**User asks:** "Am I logged in?", "Check my session"
**Response:** Confirm authentication status

## Response Rules

### MUST Follow
1. **Only return authenticated user's data** - Never fabricate information
2. **Never expose sensitive data** - No passwords, tokens, or internal IDs
3. **Verify authentication** - Check `is_authenticated` flag before responding
4. **Request authentication if missing** - Guide user to log in if not authenticated
5. **Professional tone** - Clear and direct responses

### Data Privacy
- **Safe to return:** email, name, account creation date
- **Never return:** password, password hash, JWT tokens, session IDs, internal user_id
- **Conditional:** Profile picture URL (if public), preferences (if non-sensitive)

## Examples

### Example 1: Email Query (Authenticated)
**Input:**
```json
{
  "user_data": {
    "user_id": "user_123",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "created_at": "2024-01-15T10:00:00Z",
    "is_authenticated": true
  },
  "query_type": "email"
}
```

**Output:**
```json
{
  "response": "Your email is john.doe@example.com.",
  "data_provided": {
    "email": "john.doe@example.com",
    "name": null,
    "created_at": null
  }
}
```

### Example 2: Name Query (Authenticated)
**Input:**
```json
{
  "user_data": {
    "user_id": "user_456",
    "email": "jane.smith@example.com",
    "name": "Jane Smith",
    "created_at": "2024-02-01T14:30:00Z",
    "is_authenticated": true
  },
  "query_type": "name"
}
```

**Output:**
```json
{
  "response": "You are Jane Smith.",
  "data_provided": {
    "email": null,
    "name": "Jane Smith",
    "created_at": null
  }
}
```

### Example 3: Account Info (Authenticated)
**Input:**
```json
{
  "user_data": {
    "user_id": "user_789",
    "email": "alice@example.com",
    "name": "Alice Johnson",
    "created_at": "2023-12-10T08:00:00Z",
    "is_authenticated": true
  },
  "query_type": "account_info"
}
```

**Output:**
```json
{
  "response": "Account Information:\n- Name: Alice Johnson\n- Email: alice@example.com\n- Member since: December 10, 2023",
  "data_provided": {
    "email": "alice@example.com",
    "name": "Alice Johnson",
    "created_at": "2023-12-10T08:00:00Z"
  }
}
```

### Example 4: Auth Status (Authenticated)
**Input:**
```json
{
  "user_data": {
    "user_id": "user_999",
    "email": "bob@example.com",
    "name": "Bob Wilson",
    "created_at": "2024-01-20T12:00:00Z",
    "is_authenticated": true
  },
  "query_type": "auth_status"
}
```

**Output:**
```json
{
  "response": "You are logged in as bob@example.com.",
  "data_provided": {
    "email": "bob@example.com",
    "name": null,
    "created_at": null
  }
}
```

### Example 5: Not Authenticated
**Input:**
```json
{
  "user_data": {
    "user_id": null,
    "email": null,
    "name": null,
    "created_at": null,
    "is_authenticated": false
  },
  "query_type": "email"
}
```

**Output:**
```json
{
  "response": "You are not currently logged in. Please authenticate to view your account information.",
  "data_provided": {
    "email": null,
    "name": null,
    "created_at": null
  }
}
```

### Example 6: Missing Name (Authenticated)
**Input:**
```json
{
  "user_data": {
    "user_id": "user_555",
    "email": "user@example.com",
    "name": null,
    "created_at": "2024-02-10T09:00:00Z",
    "is_authenticated": true
  },
  "query_type": "name"
}
```

**Output:**
```json
{
  "response": "Your name is not set. You can update your profile to add your name.",
  "data_provided": {
    "email": null,
    "name": null,
    "created_at": null
  }
}
```

### Example 7: Who Am I (Authenticated)
**Input:**
```json
{
  "user_data": {
    "user_id": "user_111",
    "email": "charlie@example.com",
    "name": "Charlie Brown",
    "created_at": "2024-01-05T16:00:00Z",
    "is_authenticated": true
  },
  "query_type": "name"
}
```

**Output:**
```json
{
  "response": "You are Charlie Brown (charlie@example.com).",
  "data_provided": {
    "email": "charlie@example.com",
    "name": "Charlie Brown",
    "created_at": null
  }
}
```

## Authentication Validation

### Check Authentication Status
```
IF user_data.is_authenticated = false THEN
  response = "You are not currently logged in. Please authenticate to view your account information."
  RETURN
END IF
```

### Validate User Data
```
IF user_data.email IS NULL THEN
  response = "Unable to retrieve account information. Please try logging in again."
  RETURN
END IF
```

## Response Templates

### Email Query
- **Authenticated:** "Your email is [email]."
- **Not authenticated:** "You are not currently logged in. Please authenticate to view your email."

### Name Query
- **Authenticated with name:** "You are [name]."
- **Authenticated without name:** "Your name is not set. You can update your profile to add your name."
- **Not authenticated:** "You are not currently logged in. Please authenticate to view your account information."

### Account Info
- **Authenticated:** "Account Information:\n- Name: [name]\n- Email: [email]\n- Member since: [formatted_date]"
- **Not authenticated:** "You are not currently logged in. Please authenticate to view your account information."

### Auth Status
- **Authenticated:** "You are logged in as [email]."
- **Not authenticated:** "You are not currently logged in."

## Date Formatting

Convert ISO 8601 timestamps to human-readable format:
- `2024-02-15T10:00:00Z` → "February 15, 2024"
- `2023-12-01T08:30:00Z` → "December 1, 2023"

## Edge Cases

### Null Email (Authenticated)
**Scenario:** User is authenticated but email is missing
**Response:** "Unable to retrieve account information. Please try logging in again."

### Expired Session
**Scenario:** `is_authenticated: false` but user_id present
**Response:** "Your session has expired. Please log in again to view your account information."

### Partial Data
**Scenario:** Some fields missing
**Response:** Return available data only, note missing fields

### Invalid Query Type
**Scenario:** Unknown query_type
**Response:** Default to account_info

## Quality Standards

### Deterministic Behavior
- Same user_data → Same response
- No randomness
- Consistent formatting

### Security
- Never expose passwords or tokens
- Never expose internal user_id to user
- Validate authentication before responding
- No cross-user data leakage

### Performance
- Response generation must complete in <20ms
- No external API calls
- No database queries (use provided user_data)

### User Experience
- Clear and direct responses
- Professional tone
- Helpful guidance when not authenticated
- No technical jargon

## Privacy Considerations

### GDPR Compliance
- User has right to access their own data
- Only return data belonging to authenticated user
- No data retention in this skill (stateless)

### Data Minimization
- Only return requested information
- Don't volunteer extra data unless query_type is "account_info"

## Integration Notes

**Upstream**: Receives authenticated user data from session/JWT
**Downstream**: Returns formatted response to conversation handler
**Stateless**: No memory required
**Reusable**: Can be called multiple times per session

## Error Handling

### Missing user_data
**Input:** `user_data: null`
**Output:**
```json
{
  "response": "Unable to retrieve account information. Please try logging in.",
  "data_provided": {
    "email": null,
    "name": null,
    "created_at": null
  }
}
```

### Malformed user_data
**Input:** Invalid structure
**Output:** Same as missing user_data

## Testing Checklist

- [ ] Authenticated users get correct data
- [ ] Unauthenticated users prompted to log in
- [ ] Missing fields handled gracefully
- [ ] No sensitive data exposed
- [ ] Date formatting correct
- [ ] All query types supported
- [ ] Professional tone maintained
- [ ] Performance under 20ms

## Future Enhancements

Potential additions:
- Profile picture URL
- Account preferences
- Task statistics (total tasks, completed tasks)
- Last login timestamp
- Account tier/subscription info

**Not implemented yet** to maintain simplicity and security.

---

**Version**: 1.0
**Last Updated**: 2024-02-15
**Skill ID**: SKILL-10-IDENTITY-QUERY-HANDLER
