use std::{
    future::Future,
    pin::Pin,
};
use tide::{
    Status,
    StatusCode,
};

pub async fn decode_msgpack_or_json<T, S>(req: &mut tide::Request<S>) -> tide::Result<T>
where
    for<'de> T: serde::Deserialize<'de>,
{
    let result = if req.content_type().contains(&tide::http::mime::JSON) {
        req.body_json().await?
    } else {
        let body = req.body_bytes().await?;
        rmp_serde::from_slice(&body).status(StatusCode::BadRequest)?
    };

    Ok(result)
}

pub fn error_middleware<State>(
    req: tide::Request<State>,
    next: tide::Next<'_, State>,
) -> Pin<Box<dyn Future<Output = tide::Result> + Send + '_>>
where
    State: Clone + Send + Sync + 'static,
{
    Box::pin(async move {
        let resp = next.run(req).await;

        if let Some(e) = resp.error() {
            tracing::error!(request_error = ?e);
        } else if !resp.status().is_success() {
            tracing::warn!("error response without error");
        }

        Ok(resp)
    })
}
