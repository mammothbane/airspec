use async_std::{
    fs,
    io,
    path::Path,
};
use kv::{
    Bucket,
    Json,
    Key,
};
use rand::Rng;

pub mod admin_token;
pub mod bad_packet;
pub mod user_token;

pub const KEY_SIZE: usize = 32;

lazy_static::lazy_static! {
    pub static ref DEFAULT_STORE_PATH: &'static Path = Path::new("airspecs.db");
    pub static ref OLD_STORE_PATH: &'static Path = Path::new("auth.db");
}

#[tracing::instrument(skip_all, fields(from = %OLD_STORE_PATH.display(), to = %store_path.display()))]
pub async fn try_migrate(store_path: &Path) -> io::Result<()> {
    tracing::info!("attempting db migration");

    if !OLD_STORE_PATH.exists().await || store_path.exists().await {
        tracing::info!("no migration required");
        return Ok(());
    }

    fs::rename(&*OLD_STORE_PATH, store_path).await?;

    tracing::info!("database migrated");

    Ok(())
}

#[inline]
pub fn default_store(store_path: &Path) -> Result<kv::Store, kv::Error> {
    let conf = kv::Config {
        path:            store_path.to_path_buf().into(),
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
