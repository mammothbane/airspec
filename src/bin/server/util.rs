use crate::State;
use std::sync::Arc;

pub async fn decode_msgpack_or_json<T>(req: &mut tide::Request<Arc<State>>) -> tide::Result<T>
where
    for<'de> T: serde::Deserialize<'de>,
{
    let result = if req.content_type().contains(&tide::http::mime::JSON) {
        req.body_json().await?
    } else {
        let body = req.body_bytes().await?;
        rmp_serde::from_slice(&body)?
    };

    Ok(result)
}
