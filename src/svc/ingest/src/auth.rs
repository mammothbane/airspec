use std::{
    future::Future,
    ops::{
        Deref,
        DerefMut,
    },
    pin::Pin,
    sync::Arc,
};

use kv::Store;
use tide::{
    Next,
    Status,
    StatusCode,
};

use crate::db;

#[derive(Clone, Debug)]
pub struct WithStore<S>(pub S, pub Arc<Store>);

impl<S> AsRef<Store> for WithStore<S> {
    #[inline]
    fn as_ref(&self) -> &Store {
        self.1.as_ref()
    }
}

impl<S> Deref for WithStore<S> {
    type Target = S;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl<S> DerefMut for WithStore<S> {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

#[tracing::instrument(skip_all)]
pub fn authenticate<'a, S>(
    mut req: tide::Request<S>,
    next: Next<'a, S>,
) -> Pin<Box<dyn Future<Output = tide::Result> + Send + 'a>>
where
    S: Clone + Send + Sync + AsRef<Store> + 'static,
{
    Box::pin(async move {
        let auth_values = req.remove_header("Authorization").ok_or_else(|| {
            tide::Error::from_str(StatusCode::Unauthorized, "missing 'Authorization' header")
        })?;

        let auth_count = auth_values.iter().count();
        if auth_count > 1 {
            tracing::warn!(auth_count, "received more than one authorization header, using last");
        }

        let token = hex::decode(auth_values.last().as_str()).status(StatusCode::BadRequest)?;

        let store = req.state().as_ref();
        if !db::user_token::check(store, token)? {
            return Err(tide::Error::from_str(
                StatusCode::Unauthorized,
                "token does not exist, is disabled, or has expired",
            ));
        }

        Ok(next.run(req).await)
    })
}
