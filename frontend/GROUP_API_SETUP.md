# Groups API Backend Setup Required

## Current Issue

The Groups feature frontend is **fully implemented**, but the backend API endpoints are returning an AWS authorization error:

```
"Invalid key=value pair (missing equal-sign) in Authorization header"
```

This error indicates that the **`/groups` endpoint is not properly configured** in your API Gateway.

## Root Cause

While the `project_context.md` mentions that a `GroupHandler` Lambda exists, it appears the API Gateway routes for groups are either:

1. ❌ Not created
2. ❌ Not connected to the Lambda function
3. ❌ Not configured with Cognito Authorizer
4. ❌ Using a different path structure (e.g., `/v1/groups` instead of `/groups`)

## Required Backend Configuration

To make the Groups feature work, you need to configure these API Gateway endpoints:

### **Groups Endpoints**
```
GET    /groups                          → List user's groups
POST   /groups                          → Create new group
GET    /groups/{groupId}                → Get group details
PUT    /groups/{groupId}                → Update group
DELETE /groups/{groupId}                → Delete group
```

### **Group Members Endpoints**
```
POST   /groups/{groupId}/members        → Add member to group
DELETE /groups/{groupId}/members/{userId} → Remove member
```

### **Group Transactions Endpoints**
```
GET    /groups/{groupId}/transactions   → List group transactions
POST   /groups/{groupId}/transactions   → Create group transaction
PUT    /groups/{groupId}/transactions/{txId} → Update transaction
DELETE /groups/{groupId}/transactions/{txId} → Delete transaction
```

### **Settlements Endpoint**
```
GET    /groups/{groupId}/settlements    → Calculate debts
```

## Configuration Steps (AWS Console)

### 1. Verify Lambda Function Exists
- Go to AWS Lambda Console
- Check if `GroupHandler` or similar function exists
- Note the function ARN

### 2. Create API Gateway Resources
- Go to API Gateway Console
- Open your FinTrack REST API
- Create `/groups` resource
- Create `/{groupId}` sub-resource
- Create `/members`, `/transactions`, `/settlements` sub-resources

### 3. Create Methods
- For each endpoint listed above, create the appropriate HTTP method (GET/POST/PUT/DELETE)
- Set Integration Type: **Lambda Function**
- Select your GroupHandler Lambda
- Enable **Lambda Proxy Integration**

### 4. Configure Cognito Authorizer
- For each method, go to Method Request
- Set Authorization to your **Cognito User Pool Authorizer**
- This ensures JWT tokens are validated

### 5. Enable CORS
- For each resource, enable CORS
- This allows your frontend to call the API

### 6. Deploy API
- Go to Actions → Deploy API
- Select your stage (e.g., `prod`)
- Note: The base URL should match your `.env` file

## Verification

After configuration, test with:

```bash
# Get your JWT token from browser localStorage
# Then test the endpoint:

curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://7xbcjh17v9.execute-api.ap-south-1.amazonaws.com/prod/groups
```

Expected response:
```json
{
  "groups": []
}
```

## Alternative: Check if Different Path is Used

Your API might use a version prefix. Check if any of these work:
- `/v1/groups`
- `/api/groups`
- Different staging environment

## Frontend Update (if different path)

If your backend uses a different path structure, update `groupService.js`:

```javascript
// Change from:
const response = await apiClient.get('/groups');

// To (example):
const response = await apiClient.get('/v1/groups');
```

## Current Frontend Status

✅ All Group Wallet UI components are complete and ready:
- Groups list page
- Group ledger with transactions
- Add members functionality
- Settlements calculation display
- UPI payment links

🔴 Waiting for backend API configuration to be functional.

---

**Note:** The transaction endpoints (`/transactions`, `/analytics`) are working, which confirms your API Gateway and Cognito setup is correct. You just need to add the Groups endpoints using the same configuration pattern.
