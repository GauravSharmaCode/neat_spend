# neatspend-sms-parser

Reusable SMS parsing utility for extracting transaction data from financial SMS messages.

## Usage

```js
const { parseSms } = require("neatspend-sms-parser");

const txn = parseSms("Your a/c XXXX1234 debited INR 500 at Amazon");
console.log(txn); // { amount: 500, merchant: 'Amazon', ... }
```

## API

- `parseSms(smsText)` → TransactionObject

## License

MIT
