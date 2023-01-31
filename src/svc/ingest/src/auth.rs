use std::{
    future::Future,
    pin::Pin,
};

use tide::{
    Next,
    StatusCode,
};

pub fn authenticate<'a, S>(
    mut req: tide::Request<S>,
    next: Next<'a, S>,
) -> Pin<Box<dyn Future<Output = tide::Result> + Send + 'a>>
where
    S: Clone + Send + Sync + 'static,
{
    Box::pin(async move {
        let _auth_values = req.remove_header("Authorization").ok_or_else(|| {
            tide::Error::from_str(StatusCode::Unauthorized, "missing 'Authorization' header")
        })?;

        Ok(next.run(req).await)
    })
}
