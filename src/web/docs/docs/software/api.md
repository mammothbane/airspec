# api

The ingest server's API is quite simple. You can submit data and you can query data. That's about it.

## Endpoints

### `POST /api`
Submit glasses measurements to the database.

This endpoint has different behavior depending on what `Content-Type` you specify. It can accept data points as
protobuf, msgpack, or json. Without a `Content-Type` header, expects msgpack.

#### `Content-Type: application/protobuf`
Expected message type: `/proto/svc.proto:SubmitPackets`. Embeds a sequence of `SensorPacket`.

#### `Content-Type: application/json` or `Content-Type: application/msgpack`
Expects messages formatted like an array of influx DataPoints -- which are:

```text
{
    measurement: string,
    tags: Map<string, string>,
    fields: Map<string, Value>,
    timestamp?: i64,
}
```

Please ensure that your "measurement" names align with what is in the database. These messages should also contain a tag
"system_uid" with the id of the glasses.

### `GET /api/dump`
Query params (all required):

- `id`: glasses id to use
- `start`: start timestamp (epoch millis or influx-compatible, such as `-5m`)
- `end`: end timestamp, same format as start

Response is `text/csv`. There will be multiple logical "tables" in the result, one for each sensor subsystem, split
by empty lines.

### Admin
These endpoints are intentionally left undocumented as their functionality is provided by the website.
