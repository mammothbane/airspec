use tonic::{
    self,
    Request,
    Status,
};

mod dump;
mod ingest;

pub use dump::*;
pub use ingest::*;

const AUTH_KEY: &str = "Authentication";

pub fn authenticate(mut req: Request<()>) -> Result<Request<()>, Status> {
    let _auth = req.metadata_mut().remove(AUTH_KEY).ok_or_else(|| {
        Status::unauthenticated(format!("auth key (metadata field: \"{AUTH_KEY}\") missing"))
    })?;

    Ok(req)
}
