use std::{
    cmp::Ordering,
    fmt::Formatter,
};

pub const BUCKET: &str = "bad_packet";

type Bucket<'a> = kv::Bucket<'a, kv::Integer, Vec<u8>>;

#[inline]
fn bucket(store: &kv::Store) -> Result<Bucket, kv::Error> {
    store.bucket(Some(BUCKET))
}

pub fn save(store: &kv::Store, body: &[u8]) -> Result<u64, kv::Error> {
    let id = store.generate_id()?;
    bucket(store)?.set(&id.into(), &body.to_vec())?;

    Ok(id)
}

pub fn get(store: &kv::Store, id: u64) -> Result<Vec<u8>, kv::Error> {
    bucket(store)?.get(&id.into()).map(|x| x.unwrap_or(vec![]))
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Hash)]
pub struct Info {
    key:  u64,
    size: usize,
}

impl PartialOrd for Info {
    #[inline]
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for Info {
    #[inline]
    fn cmp(&self, other: &Self) -> Ordering {
        match self.key.cmp(&other.key) {
            Ordering::Equal => self.size.cmp(&other.size),
            x => x,
        }
    }
}

impl std::fmt::Display for Info {
    #[inline]
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{} (len: {})", self.key, self.size)
    }
}

pub fn list(store: &kv::Store) -> Result<Vec<Info>, kv::Error> {
    let mut result = bucket(store)?
        .iter()
        .map(|it| -> Result<Info, kv::Error> {
            let it = it?;

            Ok(Info {
                key:  it.key()?,
                size: it.value::<Vec<u8>>()?.len(),
            })
        })
        .collect::<Result<Vec<_>, _>>()?;

    result.sort();

    Ok(result)
}

#[inline]
pub fn delete(store: &kv::Store, id: u64) -> Result<Option<Vec<u8>>, kv::Error> {
    bucket(store)?.remove(&id.into())
}

pub fn clean(store: &kv::Store, retain: Option<usize>) -> Result<Vec<u64>, kv::Error> {
    let bucket = bucket(store)?;

    let mut ids = bucket
        .iter()
        .map(|it| -> Result<u64, kv::Error> { it?.key() })
        .collect::<Result<Vec<u64>, _>>()?;

    ids.sort();

    let remove = match retain {
        Some(x) => {
            let delete_count = ids.len() - x;
            ids.into_iter().take(delete_count).collect()
        },
        None => ids,
    };

    for &id in remove.iter() {
        bucket.remove(&id.into())?;
    }

    Ok(remove)
}
