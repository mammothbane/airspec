use kv::{
    Bucket,
    Json,
    Key,
};
use rand::Rng;
use std::path::Path;

pub mod admin_token;
pub mod user_token;

pub const KEY_SIZE: usize = 32;

lazy_static::lazy_static! {
    pub static ref DEFAULT_STORE_PATH: &'static Path = Path::new("auth.db");
}

#[inline]
pub fn default_store(store_path: &Path) -> Result<kv::Store, kv::Error> {
    let conf = kv::Config {
        path:            store_path.to_owned(),
        temporary:       false,
        use_compression: false,
        flush_every_ms:  Some(1000),
        cache_capacity:  Some(128 * 1024),
        segment_size:    None,
    };

    kv::Store::new(conf)
}

#[inline]
fn dump_json_values<K, V>(bucket: &Bucket<'_, K, Json<V>>) -> Result<Vec<V>, kv::Error>
where
    for<'k> K: Key<'k>,
    V: serde::de::DeserializeOwned + serde::Serialize,
{
    let items = bucket
        .iter()
        .map(|item| {
            let result: Result<V, kv::Error> = try {
                let item = item?;
                let value = item.value::<Json<V>>()?.0;
                value
            };

            result
        })
        .collect::<Result<Vec<V>, _>>()?;

    Ok(items)
}

#[inline]
fn gen_key() -> Vec<u8> {
    rand::thread_rng().sample_iter(rand::distributions::Standard).take(KEY_SIZE).collect()
}
