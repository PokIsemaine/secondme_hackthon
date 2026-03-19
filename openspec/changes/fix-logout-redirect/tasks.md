## 1. Modify logout button handler

- [x] 1.1 Replace `window.location.href` with `fetch('/api/auth/logout', { method: 'POST' })`
- [x] 1.2 Add async/await to handle the API call
- [x] 1.3 Add try/catch for error handling

## 2. Add resetAllState function

- [x] 2.1 Create `resetAllState()` function to reset all client state
- [x] 2.2 Call `resetAllState()` after successful logout API call

## 3. Verify implementation

- [ ] 3.1 Confirm logout button now sends POST request
- [ ] 3.2 Confirm all client state is cleared after logout
- [ ] 3.3 Confirm UI shows unauthenticated login prompt page after logout
