use kv::{
    Json,
    Store,
};
use tide::{
    Status,
    StatusCode,
};

use crate::db;

pub const BUCKET_NAME: &str = "admin_auth";

#[derive(Clone, Debug, PartialEq, Hash, serde::Serialize, serde::Deserialize)]
pub struct AdminTokenData {
    pub name:   String,
    pub active: bool,
}

#[derive(Clone, Debug, PartialEq, Hash, serde::Serialize, serde::Deserialize)]
pub struct AdminTokenInfo {
    pub id:   u64,
    #[serde(flatten)]
    pub data: AdminTokenData,
}

type Bucket<'a> = kv::Bucket<'a, Vec<u8>, Json<AdminTokenInfo>>;

#[inline]
fn bucket(store: &Store) -> Result<Bucket, kv::Error> {
    store.bucket::<Vec<u8>, Json<AdminTokenInfo>>(Some(BUCKET_NAME))
}

#[inline]
pub fn get(store: &Store, token: impl AsRef<Vec<u8>>) -> Result<Option<AdminTokenInfo>, kv::Error> {
    let result = bucket(store)?.get(token.as_ref())?.map(|x| x.0);

    Ok(result)
}

#[inline]
pub fn list(store: &Store) -> Result<Vec<AdminTokenInfo>, kv::Error> {
    db::dump_json_values(&bucket(store)?)
}

pub fn create(store: &Store, data: AdminTokenData) -> Result<(Vec<u8>, u64), kv::Error> {
    let bucket = bucket(store)?;

    let key = db::gen_key();
    let id = store.generate_id()?;

    bucket.set(
        &key,
        &Json(AdminTokenInfo {
            data,
            id,
        }),
    )?;

    Ok((key, id))
}

pub fn set_enabled(store: &Store, id: u64, desired_state: bool) -> Result<(), tide::Error> {
    let bucket = bucket(store)?;

    let item = bucket.iter().find(|x| {
        let value: Option<u64> =
            try { x.as_ref().ok()?.value::<Json<AdminTokenInfo>>().ok()?.0.id };

        value.contains(&id)
    });

    let Some(Ok(item)) = item else {
        return Err(tide::Error::from_str(
            StatusCode::NotFound,
            "user for provided id was not found",
        ))
    };

    let key = item.key::<Vec<u8>>()?;

    let value = item.value::<Json<AdminTokenInfo>>()?.0;

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
