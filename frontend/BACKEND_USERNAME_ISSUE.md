# Backend Username Display Issue

## Current Problem

The `GET /groups/{id}` API is returning members like this:

```json
{
  "members": [
    {
      "userId": "61332dda-7021-705d-5ed1-c808acff49ff",
      "name": "61332dda-7021-705d-5ed1-c808acff49ff"  // ❌ This is wrong!
    },
    {
      "userId": "undefined",  // ❌ This is garbage data
      "name": "undefined"
    }
  ]
}
```

**Issues:**
1. The `name` field contains the UUID, not the actual username/email
2. There's an invalid member with `userId: 'undefined'`

## What the Backend Should Return

```json
{
  "members": [
    {
      "userId": "61332dda-7021-705d-5ed1-c808acff49ff",
      "name": "John Doe"  // ✅ Actual user's name from Cognito
    },
    {
      "userId": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
      "name": "jane@example.com"  // ✅ Or their email
    }
  ]
}
```

## Required Backend Fix

In your Lambda `GET /groups/{id}` handler:

```javascript
// WRONG (current implementation):
const members = groupMembers.map(userId => ({
  userId: userId,
  name: userId  // ❌ Just copying the ID
}));

// CORRECT:
const members = await Promise.all(
  groupMembers
    .filter(userId => userId && userId !== 'undefined')  // Remove garbage data
    .map(async (userId) => {
      // Fetch user details from Cognito
      const userInfo = await cognito.adminGetUser({
        UserPoolId: process.env.USER_POOL_ID,
        Username: userId
      }).promise();
      
      // Extract name or email from Cognito attributes
      const nameAttr = userInfo.UserAttributes.find(a => a.Name === 'name');
      const emailAttr = userInfo.UserAttributes.find(a => a.Name === 'email');
      
      return {
        userId: userId,
        name: nameAttr?.Value || emailAttr?.Value || userId  // Real name!
      };
    })
);
```

## Frontend Workaround (Temporary)

I've added a workaround in the frontend:

1. **Filter out invalid members** with `userId === 'undefined'`
2. **Display shortened UUID** when `name === userId` (meaning backend didn't provide real name)

The dropdown will now show:
- `User 61332dda…` instead of the full UUID
- Invalid members are filtered out

But this is just a **temporary workaround**. The backend needs to be fixed to return actual usernames.

## Steps to Fix

1. **Update Lambda `GET /groups/{id}`** to fetch user details from Cognito
2. **Return the actual `name` or `email`** attribute from Cognito
3. **Filter out any undefined/null userIds** before processing
4. **Test the API** - you should see real names in the response

Once the backend is fixed, the frontend will automatically display real names with zero code changes.

---

**Current Status:**
- ✅ Frontend handles the data correctly
- 🔴 Backend returns userId as name
- 🔴 Backend returns invalid 'undefined' members
- ⚠️ Temporary workaround in place (shows "User 61332dda…")
