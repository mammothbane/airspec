//! This module implements an auth scheme.

use std::{
    future::Future,
    pin::Pin,
    sync::Arc,
};

use tide::StatusCode;
use tracing::Instrument;

use crate::db;

mod auth_token;

#[derive(Debug, Clone)]
pub struct State {
    store: Arc<kv::Store>,
}

pub fn server(store: Arc<kv::Store>) -> tide::Server<State> {
    let mut server = tide::with_state(State {
        store,
    });

    server.with(admin_auth_middleware);

    let mut auth_route = server.at("/auth_token");

    auth_route.get(auth_token::list).post(auth_token::create).put(auth_token::create);

    auth_route.at("/:id").post(auth_token::set_enabled).delete(auth_token::delete);

    server
}

fn admin_auth_middleware<'a>(
    mut req: tide::Request<State>,
    next: tide::Next<'a, State>,
) -> Pin<Box<dyn Future<Output = tide::Result> + Send + 'a>> {
    Box::pin(async move {
        let auth_header = req.remove_header("Authorization");

        let token = auth_header
            .as_ref()
            .map(|vals| vals.last().as_str())
            .unwrap_or("")
            .strip_prefix("Bearer ")
            .ok_or_else(|| {
                tide::Error::from_str(
                    StatusCode::Unauthorized,
                    "missing or malformed authorization header (expect Bearer)",
                )
            })?
            .trim();

        let token = hex::decode(token)?;
        if token.len() != db::KEY_SIZE {
            return Err(tide::Error::from_str(
                StatusCode::BadRequest,
                "auth token of unexpected size",
            ));
        }

        let store = &req.state().store;

        fn invalid_auth_user() -> tide::Error {
            tide::Error::from_str(
                StatusCode::Unauthorized,
                "admin auth token does not exist or has been disabled",
            )
        }

        let admin_info = db::admin_token::get(store, &token)?.ok_or_else(invalid_auth_user)?;

        if !admin_info.data.active {
            return Err(invalid_auth_user());
        }

        let span = tracing::info_span!("admin authenticated", ?admin_info);

        req.set_ext(admin_info);

        Ok(next.run(req).instrument(span).await)
    })
}
