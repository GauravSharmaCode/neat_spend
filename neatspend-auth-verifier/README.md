# neatspend-auth-verifier

Reusable utility for verifying Firebase JWTs and extracting user info in Node.js/Express services.

## Usage

```js
const { verifyAuthToken } = require("neatspend-auth-verifier");

// Express middleware example
app.use(async (req, res, next) => {
  try {
    req.user = await verifyAuthToken(req.headers.authorization);
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
});
```

## API

- `verifyAuthToken(token)` → Promise<User>

## License

MIT
