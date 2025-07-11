# @neatspend/logger

Reusable logger utility for consistent, structured, and leveled logging across Node.js services.

## Usage

```js
const { logWithMeta } = require("@neatspend/logger");
logWithMeta("Hello world!", { level: "info", func: "main" });
```

## Features

- JSON log output (great for cloud logging)
- Log levels: info, warn, error
- Auto-includes timestamp, filename, function name
- Optional transport hooks (Sentry, Slack, file, etc)

## License

MIT
