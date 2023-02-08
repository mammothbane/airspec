use tide::StatusCode;

use crate::{
    db::{
        user_token,
        user_token::UserAuthData,
    },
    endpoints::admin::{
        ResponsibleAdmin,
        State,
    },
    util,
};

pub async fn list(req: tide::Request<State>) -> tide::Result {
    let store = &req.state().store;

    let auth_infos = user_token::list_tokens(store)?;
    let info_json = serde_json::to_string(&auth_infos)?;

    Ok(info_json.into())
}

pub async fn create(mut req: tide::Request<State>) -> tide::Result {
    let &admin = req
        .ext::<ResponsibleAdmin>()
        .ok_or_else(|| tide::Error::from_str(StatusCode::InternalServerError, "admin unset"))?;

    let data = util::decode_msgpack_or_json::<UserAuthData, _>(&mut req).await?;

    let key = user_token::create(&req.state().store, data, admin.0)?;
    let key = hex::encode(key);

    Ok(key.into())
}

#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct EnableRequest {
    enable: bool,
}

pub async fn set_enabled(req: tide::Request<State>) -> tide::Result {
    let id = req.param("id")?.parse::<u64>()?;
    let desired_state = req.query::<EnableRequest>()?;

    user_token::set_enabled(&req.state().store, id, desired_state.enable)?;

    Ok(StatusCode::Ok.into())
}

pub async fn delete(req: tide::Request<State>) -> tide::Result {
    let id = req.param("id")?.parse::<u64>()?;

    user_token::delete(&req.state().store, id)?;

    Ok(StatusCode::Ok.into())
}
