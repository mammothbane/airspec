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
