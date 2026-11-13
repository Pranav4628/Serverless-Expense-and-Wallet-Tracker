# Groups Feature - Debugging Guide

## Issues Identified

### Issue 1: Groups List Shows "0 members"
**Location:** `/groups` page  
**Symptom:** All group cards display "0 members"

**Root Cause:**
The backend `GET /groups` API needs to return `memberCount` for each group in the list.

**Expected API Response Format:**
```json
{
  "groups": [
    {
      "groupId": "GROUP#123",
      "groupName": "Friends",
      "memberCount": 3,          // ← THIS FIELD IS REQUIRED
      "netBalance": 0.00,
      "createdAt": "2026-11-11T10:00:00Z"
    }
  ]
}
```

**Backend Fix Required:**
Update the Lambda function for `GET /groups` to include `memberCount` in each group object.

---

### Issue 2: "Paid By" Dropdown is Empty
**Location:** Group Ledger → Add Expense modal  
**Symptom:** The "Paid By" dropdown only shows "Select member..." with no options

**Root Cause:**
The backend `GET /groups/{id}` API needs to return a `members` array with full member details.

**Expected API Response Format:**
```json
{
  "group": {
    "groupId": "GROUP#123",
    "groupName": "Friends",
    "memberCount": 3,
    "members": [              // ← THIS ARRAY IS REQUIRED
      {
        "userId": "USER#abc123",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "admin"       // optional
      },
      {
        "userId": "USER#def456",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "role": "member"
      }
    ],
    "netBalance": 0.00,
    "createdAt": "2026-11-11T10:00:00Z"
  }
}
```

**Backend Fix Required:**
Update the Lambda function for `GET /groups/{id}` to include the full `members` array with:
- `userId` (required - must match the user's Cognito sub)
- `name` or `email` (required - for display in dropdown)
- Any other member metadata

---

## How to Debug

### Step 1: Check Browser Console
I've added console logging to both pages. Open the browser DevTools (F12) and check the Console tab:

**On `/groups` page, look for:**
```
📋 Groups List API Response: { ... }
📋 Parsed groups array: [ ... ]
```

**On `/groups/{id}` page, look for:**
```
🔍 Group API Response: { ... }
👥 Members array: [ ... ]
📊 Member count: ...
```

### Step 2: Verify API Response Structure

**Test `GET /groups` manually:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://7xbcjh17v9.execute-api.ap-south-1.amazonaws.com/prod/groups
```

**Test `GET /groups/{id}` manually:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://7xbcjh17v9.execute-api.ap-south-1.amazonaws.com/prod/groups/GROUP#123
```

Check if the responses include:
- ✅ `memberCount` field
- ✅ `members` array with user details

---

## Frontend Code Changes Made

### GroupsPage.jsx
Added console logging to see what the `GET /groups` API returns:
```javascript
console.log('📋 Groups List API Response:', response);
console.log('📋 Parsed groups array:', groupData);
```

The `GroupCard` component already tries to use `memberCount`:
```javascript
const memberCount = group.members?.length ?? group.memberCount ?? 0;
```

### GroupLedgerPage.jsx
Added console logging to see what the `GET /groups/{id}` API returns:
```javascript
console.log('🔍 Group API Response:', { response, groupData });
console.log('👥 Members array:', groupData?.members);
console.log('📊 Member count:', groupData?.memberCount);
```

The members are extracted and passed to the modal:
```javascript
const members = group?.members ?? [];
```

---

## Backend Lambda Changes Needed

### In `GET /groups` Handler:

```javascript
// For each group, add memberCount
const groups = await fetchUserGroups(userId);
const groupsWithCount = groups.map(group => ({
  ...group,
  memberCount: group.members?.length ?? 0  // Calculate from members array
}));

return {
  statusCode: 200,
  body: JSON.stringify({ groups: groupsWithCount })
};
```

### In `GET /groups/{id}` Handler:

```javascript
// Fetch group with full member details
const group = await getGroupById(groupId);

// Ensure members array is populated
const membersData = await Promise.all(
  group.memberUserIds.map(async (userId) => {
    const userInfo = await getUserInfo(userId);  // Fetch from Cognito or DynamoDB
    return {
      userId: userId,
      name: userInfo.name,
      email: userInfo.email,
      // Add any other fields needed
    };
  })
);

return {
  statusCode: 200,
  body: JSON.stringify({
    group: {
      ...group,
      memberCount: membersData.length,
      members: membersData  // Full array with user details
    }
  })
};
```

---

## Verification Steps

After fixing the backend:

1. **Refresh the `/groups` page**
   - Each group card should show the correct member count
   - Console should show: `📊 Member count: 3` (or actual count)

2. **Click into a group**
   - Header should show: "3 members" (or actual count)
   - Console should show: `👥 Members array: [{ userId: ..., name: ... }, ...]`

3. **Click "Add Expense"**
   - "Paid By" dropdown should list all members by name
   - You should be able to select any member

---

## Quick Test Without Backend Changes

If you want to test the UI with mock data while waiting for backend fixes, run this in the browser console on the group page:

```javascript
// Mock group data
const mockGroup = {
  groupId: "GROUP#test123",
  groupName: "Test Group",
  memberCount: 2,
  members: [
    { userId: "USER#1", name: "Alice", email: "alice@test.com" },
    { userId: "USER#2", name: "Bob", email: "bob@test.com" }
  ],
  netBalance: 100.50
};

// This will show you how the UI should look with proper data
console.log("Mock group data:", mockGroup);
```

---

## Summary

Both issues are **backend data issues**, not frontend bugs:

1. ✅ Frontend code is correct and ready
2. 🔴 Backend `GET /groups` needs to return `memberCount`
3. 🔴 Backend `GET /groups/{id}` needs to return full `members` array

Once the backend returns the expected data structure, both issues will be resolved automatically.
