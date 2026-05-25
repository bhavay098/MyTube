# Youtube backedn project

- [Model Link](https://app.eraser.io/workspace/SXMpBmw6Ofld6FPsMr6K?origin=)

# 🍪 What are cookies?
- Cookies are small pieces of data (usually key-value pairs) that a server asks a browser to store.
- They live on the client-side (browser) but are sent back to the server with every HTTP request to the same domain.
- They’re mainly used to remember information about a user across requests (since HTTP itself is stateless).

## Common uses of cookies:
- **Authentication / sessions** -> Keep users logged in.
- **Preferences** -> Remember theme, language, cart items.
- **Tracking / analytics** -> Track user activity (ads, analytics, etc.).

## Types of cookies:
1. **Session cookies:**
    - Stored only until the browser is closed.
    - Used for temporary sessions.

2. **Persistent cookies:**
    - Have an expiry date.
    - Stay even after closing the browser.

3. **Secure & HttpOnly cookies:**
    - `Secure`: only sent over HTTPS.
    - `HttpOnly`: not accessible via JavaScript (document.cookie), only by the server (helps prevent XSS attacks).

4. **SameSite cookies:**
    - Control whether cookies are sent with cross-site requests (important for CSRF protection).

👉 In short: Cookies = tiny bits of stateful memory between browser and server. They solve the problem that HTTP itself forgets who you are after each request.

---

# 🔑 What is jsonwebtoken (JWT)?
`jsonwebtoken` (or JWT) is a way to create secure tokens that can be sent between server and client to verify identity.It’s commonly used for authentication in web apps (login systems).  
It is a token format (not a type of token). Both access tokens and sometimes refresh tokens can be JWTs.

## Access Tokens?
**<u>What they are:</u>**  
A short-lived credential (string) that a client (e.g., your frontend app) uses to access protected resources on a server (e.g., APIs).

**<u>Use case:</u>**  
Sent along with each request (usually in the `Authorization: Bearer <token>` header).

**<u>Lifespan:</u>**  
Typically short (minutes to an hour) for security reasons.
If stolen, the attacker only has access for a short time.

## Refresh Tokens?
**<u>What they are:</u>**  
A longer-lived credential used to get a new access token when the old one expires.

**<u>Use case:</u>**  
Stored securely (usually in HTTP-only cookies or secure storage). Sent only when refreshing the access token, not with every request.

**<u>Lifespan:</u>**  
Longer (days, weeks, even months). If compromised, it can be very dangerous, so it must be stored carefully and revoked easily.

## How they all work together:
1. User logs in -> server issues access token (JWT) + refresh token (JWT or random string).
2. Client uses the access token in API requests.
3. When it expires -> client sends refresh token to server.
4. Server validates refresh token -> issues new access token.
5. Repeat until refresh token expires -> then user must log in again.

This way, the server doesn’t have to store sessions — the token itself carries the authentication data.

👉 Think of it like this:
- **Access token** = room keycard (expires quickly, use it often).
- **Refresh token** = VIP pass (lasts longer, used only to get a new keycard).
- **JWT** = the format in which these passes are printed.

---

# 📌 What is Middleware?
Middleware is like a middle layer between the request from the client and the response from the server.  
In an Express.js app (and many other frameworks), middleware are just functions that run before your request reaches the final route handler or before the response is sent back.

## How Middleware Works (Step by Step)?
1. A client (browser, app, etc.) makes a request → e.g., `/login`
2. Express runs your middleware functions in order.
3. Each middleware can:
    - Do something with the request (`req`) or response (`res`) objects.
    - End the request-response cycle (e.g., send a response directly).
    - Or call `next()` to pass control to the next middleware.
4. Finally, if no middleware ended the cycle, Express sends the response from the route handler.

---

# 📌 What is an Aggregation Pipeline?
Think of it like a data processing pipeline:
- You take documents (your data).
- You pass them through stages one by one.
- Each stage transforms the data in some way (filter, group, sort, etc.).
- The final output is your processed result.

It’s similar to SQL queries with `GROUP BY`, `JOIN`, `ORDER BY`, etc., but done in steps.

## Common Stages
1. **$match** -> Filter documents (like SQL `WHERE`).
2. **$project** -> Choose which fields to show/hide, or add computed fields.
3. **$group** -> Group documents (like SQL `GROUP BY`).
4. **$sort** -> Sort documents.
5. **$limit / $skip** -> Paginate results.
6. **$lookup** -> Join with another collection (like SQL `JOIN`).

**✅ In short:**
- Aggregation Pipeline = step-by-step data processing.
- Each stage transforms the documents.
- Useful for analytics, reports, joins, and advanced queries.