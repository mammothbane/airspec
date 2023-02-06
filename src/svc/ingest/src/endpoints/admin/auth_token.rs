use chrono::Utc;
use kv::Json;
use rand::Rng;
use tide::{
    Status,
    StatusCode,
};

use crate::{
    endpoints::admin::{
        ResponsibleAdmin,
        State,
    },
    util,
};

pub const USER_AUTH_BUCKET: &str = "user_auth";
pub const KEY_SIZE: usize = 32;

#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct UserAuthData {
    name:       String,
    active:     bool,
    #[serde(with = "chrono::serde::ts_nanoseconds_option")]
    expiration: Option<chrono::DateTime<Utc>>,
}

#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct UserAuthInfo {
    #[serde(flatten)]
    data:            UserAuthData,
    id:              u64,
    #[serde(with = "chrono::serde::ts_nanoseconds")]
    issued:          chrono::DateTime<Utc>,
    issued_by_token: u64,
}

type UserAuthBucket<'a> = kv::Bucket<'a, Vec<u8>, Json<UserAuthInfo>>;

#[inline]
fn bucket(store: &kv::Store) -> Result<UserAuthBucket, kv::Error> {
    store.bucket::<Vec<u8>, Json<UserAuthInfo>>(Some(USER_AUTH_BUCKET))
}

pub async fn list(req: tide::Request<State>) -> tide::Result {
    let store = &req.state().store;
    let bucket = bucket(store)?;

    let auth_infos = bucket
        .iter()
        .map(|item| {
            let result: Result<UserAuthInfo, kv::Error> = try {
                let item = item?;

                item.value::<Json<UserAuthInfo>>()?.0
            };

            result
        })
        .collect::<Result<Vec<UserAuthInfo>, _>>()?;

    let info_json = serde_json::to_string(&auth_infos)?;

    Ok(info_json.into())
}

pub async fn create(mut req: tide::Request<State>) -> tide::Result {
    let &admin = req
        .ext::<ResponsibleAdmin>()
        .ok_or_else(|| tide::Error::from_str(StatusCode::InternalServerError, "admin unset"))?;

    let data = util::decode_msgpack_or_json::<UserAuthData, _>(&mut req).await?;

    let store = &req.state().store;
    let bucket = bucket(store)?;

    let info = UserAuthInfo {
        id: store.generate_id()?,
        data,
        issued: Utc::now(),
        issued_by_token: admin.0,
    };

    let key = rand::thread_rng()
        .sample_iter(rand::distributions::Standard)
        .take(KEY_SIZE)
        .collect::<Vec<u8>>();

    bucket.set(&key, &Json(info))?;

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

    let store = &req.state().store;
    let bucket = bucket(store)?;

    let item = bucket.iter().find(|x| {
        let value: Option<u64> = try { x.as_ref().ok()?.value::<Json<UserAuthInfo>>().ok()?.0.id };

        value.contains(&id)
    });

    let Some(Ok(item)) = item else {
        return Err(tide::Error::from_str(StatusCode::NotFound, "user for provided id was not found"))
    };

    let key = item.key::<Vec<u8>>()?;

    let value = item.value::<Json<UserAuthInfo>>()?.0;

    let new = {
        let mut result = value.clone();
        result.data.active = desired_state.enable;
        result
    };

    bucket
        .compare_and_swap(&key, Some(&Json(value)), Some(&Json(new)))
        .status(StatusCode::Conflict)?;

    Ok(StatusCode::Ok.into())
}
