# Skill: API Behavior Validation

## Purpose
Verify that API endpoints behave correctly according to specifications, including request handling, response formats, status codes, and error handling.

## When to Use
- After implementing API endpoints
- During API review phases
- Before API release
- When debugging API issues

## Instruction

### API Validation Framework

```yaml
validation_areas:
  request_handling:
    - Method acceptance
    - Path resolution
    - Query parameter handling
    - Request body parsing
    - Header processing

  response_generation:
    - Status codes
    - Response body format
    - Header inclusion
    - Content type

  error_handling:
    - Validation errors
    - Authentication errors
    - Not found errors
    - Server errors

  edge_cases:
    - Empty inputs
    - Boundary values
    - Concurrent requests
    - Large payloads
```

### Request Validation

#### Method Validation

```yaml
validate_for_each_endpoint:
  correct_method:
    test: Send request with specified method
    expected: Successful response or appropriate error

  wrong_method:
    test: Send request with wrong method
    expected: 405 Method Not Allowed

  options_preflight:
    test: Send OPTIONS request
    expected: 200 with CORS headers (if CORS enabled)
```

#### Path Validation

```yaml
path_tests:
  exact_match:
    test: /api/tasks
    expected: Route handler invoked

  trailing_slash:
    test: /api/tasks/
    expected: Same as without slash (or 404 based on config)

  case_sensitivity:
    test: /API/Tasks vs /api/tasks
    expected: Defined behavior (typically case sensitive)

  path_parameters:
    test: /api/tasks/123
    expected: Parameter extracted correctly
```

#### Request Body Validation

```yaml
body_tests:
  valid_json:
    test: Well-formed JSON with required fields
    expected: 201/200 Success

  invalid_json:
    test: Malformed JSON
    expected: 400 Bad Request

  missing_required:
    test: JSON without required field
    expected: 422 Validation Error with field info

  extra_fields:
    test: JSON with extra fields
    expected: Ignored or rejected (per policy)

  wrong_types:
    test: String where number expected
    expected: 422 Validation Error

  empty_body:
    test: No body on POST
    expected: 400/422 Error
```

### Response Validation

#### Status Code Validation

```yaml
status_code_tests:

  success_codes:
    GET_single:
      expected: 200 OK
    GET_list:
      expected: 200 OK
    POST_create:
      expected: 201 Created
    PUT_update:
      expected: 200 OK
    DELETE_remove:
      expected: 204 No Content (or 200 with body)

  client_error_codes:
    bad_request:
      condition: Invalid request format
      expected: 400 Bad Request
    unauthorized:
      condition: Missing/invalid authentication
      expected: 401 Unauthorized
    forbidden:
      condition: Authenticated but not permitted
      expected: 403 Forbidden
    not_found:
      condition: Resource doesn't exist
      expected: 404 Not Found
    validation_error:
      condition: Business validation fails
      expected: 422 Unprocessable Entity
```

#### Response Body Validation

```yaml
response_body_tests:

  success_response:
    structure:
      test: Response matches documented schema
      check:
        - All documented fields present
        - No undocumented fields (optional)
        - Types match schema

  collection_response:
    structure:
      test: List endpoint response
      check:
        - data array present
        - meta object with pagination (if paginated)
        - Items match item schema

  error_response:
    structure:
      test: Error format consistent
      check:
        - error or detail field present
        - Error code present
        - Helpful message (no internal details)

  nested_objects:
    structure:
      test: Nested data correct
      check:
        - Nested objects match schema
        - Relationships resolved correctly
```

### Validation Test Matrix

```yaml
endpoint_test_matrix:
  format: |
    For each endpoint, test all these scenarios

  endpoint_template:
    path: "/api/[resource]"
    method: "[GET/POST/PUT/DELETE]"

    tests:
      authentication:
        - No token → 401
        - Invalid token → 401
        - Valid token → proceeds

      authorization:
        - Non-owner → 404 (or 403)
        - Owner → proceeds

      validation:
        - Missing required → 422
        - Wrong type → 422
        - Valid data → proceeds

      success:
        - Correct status code
        - Correct response body
        - Correct headers

      edge_cases:
        - Endpoint specific edge cases
```

### Test Execution Template

```yaml
test_case_format:
  id: TC-API-001
  endpoint: POST /api/tasks
  description: Create task with valid data

  preconditions:
    - User is authenticated
    - User has task creation permission

  request:
    method: POST
    path: /api/tasks
    headers:
      Authorization: Bearer {valid_token}
      Content-Type: application/json
    body:
      title: "Test task"
      description: "Test description"

  expected_response:
    status: 201
    headers:
      Content-Type: application/json
    body:
      id: "{uuid}"
      title: "Test task"
      description: "Test description"
      status: "pending"
      created_at: "{timestamp}"

  assertions:
    - status == 201
    - body.id is UUID
    - body.title == request.body.title
    - body.status == "pending"
    - body.user_id == authenticated_user.id
```

### API Validation Report

```markdown
# API Validation Report

## Endpoint: POST /api/tasks
## Validation Date: [Date]

### Test Results Summary
| Category | Passed | Failed | Skipped |
|----------|--------|--------|---------|
| Authentication | 3 | 0 | 0 |
| Validation | 5 | 1 | 0 |
| Success Cases | 2 | 0 | 0 |
| Error Cases | 4 | 1 | 0 |
| **Total** | **14** | **2** | **0** |

### Detailed Results

#### Authentication Tests
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| No token | 401 | 401 | ✅ |
| Invalid token | 401 | 401 | ✅ |
| Expired token | 401 | 401 | ✅ |

#### Validation Tests
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Missing title | 422 | 422 | ✅ |
| Empty title | 422 | 422 | ✅ |
| Title too long | 422 | 200 | ❌ |
| Valid data | 201 | 201 | ✅ |

#### Response Format Tests
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Has id field | UUID | UUID | ✅ |
| Has created_at | timestamp | timestamp | ✅ |
| Status code | 201 | 201 | ✅ |

### Failed Tests Detail

#### FAIL: Title too long validation
- **Test**: Send title with 300 characters
- **Expected**: 422 with validation error
- **Actual**: 200 with truncated title
- **Spec Reference**: @specs/tasks/spec.md#validation
- **Recommendation**: Add max_length validation to TaskCreate schema

#### FAIL: Error response format
- **Test**: Trigger validation error
- **Expected**: { "detail": "...", "errors": [...] }
- **Actual**: { "detail": "..." } - missing errors array
- **Recommendation**: Include field-level errors in response

### Recommendations
1. Add max_length validation for title field
2. Include field-level errors in 422 responses
3. Review spec for other validation rules not implemented
```

### Validation Checklist

```yaml
per_endpoint:
  authentication:
    - [ ] Returns 401 without token
    - [ ] Returns 401 with invalid token
    - [ ] Returns 401 with expired token
    - [ ] Accepts valid token

  validation:
    - [ ] Rejects missing required fields
    - [ ] Rejects wrong field types
    - [ ] Enforces field constraints
    - [ ] Returns 422 with field info

  success:
    - [ ] Returns correct status code
    - [ ] Response matches schema
    - [ ] All required fields present
    - [ ] Types match expected

  errors:
    - [ ] Error format is consistent
    - [ ] Error messages are helpful
    - [ ] No internal details exposed
    - [ ] Status codes match spec
```

## Output Format
API validation report with test results and findings suitable for QA documentation.

## Related Skills
- validate-implementation-against-spec
- detect-spec-violations
- review-auth-behavior
