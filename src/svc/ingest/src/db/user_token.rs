use chrono::Utc;
use kv::{
    Json,
    Store,
};
use tide::{
    Status,
    StatusCode,
};

use crate::db;

pub const BUCKET_NAME: &str = "user_tokens";

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
    issued_by_admin: u64,
}

type UserAuthBucket<'a> = kv::Bucket<'a, Vec<u8>, Json<UserAuthInfo>>;

#[inline]
fn bucket(store: &Store) -> Result<UserAuthBucket, kv::Error> {
    store.bucket::<Vec<u8>, Json<UserAuthInfo>>(Some(BUCKET_NAME))
}

pub fn check(store: &Store, token: Vec<u8>) -> Result<bool, kv::Error> {
    let result = bucket(store)?
        .get(&token)?
        .map(|Json(info)| {
            if !info.data.active {
                return false;
            }

            match info.data.expiration {
                None => true,
                Some(exp) => Utc::now() <= exp,
            }
        })
        .unwrap_or(false);

    Ok(result)
}

#[inline]
pub fn list_tokens(store: &Store) -> Result<Vec<UserAuthInfo>, kv::Error> {
    db::dump_json_values(&bucket(store)?)
}

pub fn create(store: &Store, data: UserAuthData, admin: u64) -> Result<Vec<u8>, kv::Error> {
    let bucket = bucket(store)?;

    let info = UserAuthInfo {
        id: store.generate_id()?,
        data,
        issued: Utc::now(),
        issued_by_admin: admin,
    };

    let key = db::gen_key();

    bucket.set(&key, &Json(info))?;

    Ok(key)
}

pub fn delete(store: &Store, token_id: u64) -> Result<bool, kv::Error> {
    let bucket = bucket(store)?;

    let item = bucket.iter().find(|info| {
        let Ok(item) = info else {
            return false;
        };

        let Ok(Json(value)) = item.value::<Json<UserAuthInfo>>() else {
            return false;
        };

        value.id == token_id
    });

    let Some(item) = item else {
        return Ok(false);
    };

    let item = item?;

    let token = item.key::<Vec<u8>>()?;

    bucket.remove(&token)?;

    let value = item.value::<Json<UserAuthInfo>>()?.0;
    tracing::info!(%token_id, token_info = ?value, "token deleted");

    Ok(true)
}

pub fn set_enabled(store: &Store, id: u64, desired_state: bool) -> Result<(), tide::Error> {
    let bucket = bucket(store)?;

    let item = bucket.iter().find(|x| {
        let value: Option<u64> = try { x.as_ref().ok()?.value::<Json<UserAuthInfo>>().ok()?.0.id };

        value.contains(&id)
    });

    let Some(Ok(item)) = item else {
        return Err(tide::Error::from_str(
            StatusCode::NotFound,
            "user for provided id was not found",
        ))
    };

    let key = item.key::<Vec<u8>>()?;

    let value = item.value::<Json<UserAuthInfo>>()?.0;

    let new = {
        let mut result = value.clone();
        result.data.active = desired_state;
        result
    };

    bucket
        .compare_and_swap(&key, Some(&Json(value)), Some(&Json(new)))
        .status(StatusCode::Conflict)?;

    Ok(())
}
