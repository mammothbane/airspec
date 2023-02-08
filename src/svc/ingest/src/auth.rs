use chrono::Utc;
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
use tracing::Instrument;

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

        fn unauth_token() -> tide::Error {
            tide::Error::from_str(
                StatusCode::Unauthorized,
                "token does not exist, is disabled, or has expired",
            )
        }

        let Some(info) = db::user_token::get(req.state().as_ref(), token)? else {
            return Err(unauth_token());
        };

        if !info.data.active {
            return Err(unauth_token());
        }

        if let Some(expiration) = info.data.expiration && expiration < Utc::now() {
            return Err(unauth_token());
        }

        let span = tracing::info_span!("user authenticated", user_info = ?info);
        req.set_ext(info);

        Ok(next.run(req).instrument(span).await)
    })
}
