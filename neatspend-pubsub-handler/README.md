# neatspend-pubsub-handler

Reusable Pub/Sub event handler utilities for Google Cloud Pub/Sub integrations.

## Usage

```js
const { handlePubSubEvent } = require("neatspend-pubsub-handler");

exports.myHandler = (event, context) => {
  handlePubSubEvent(event, (data) => {
    // process data
  });
};
```

## API

- `handlePubSubEvent(event, callback)`

## License

MIT
