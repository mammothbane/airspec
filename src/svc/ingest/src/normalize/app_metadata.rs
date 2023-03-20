use influxdb2::models::DataPoint;
use tap::Pipe;

use crate::{
    normalize::{
        AugmentDatapoint,
        Error,
        ToDatapoints,
    },
    pb::AppMetaDataPacket,
};

impl ToDatapoints for AppMetaDataPacket {
    fn to_data_points<T>(&self, augment: &T) -> Result<Vec<DataPoint>, Error>
    where
        T: AugmentDatapoint,
    {
        let AppMetaDataPacket {
            ref payload,
            timestamp_unix,
            r#type,
        } = *self;

        let result = DataPoint::builder("app_metadata")
            .timestamp(crate::normalize::inspect_and_rescale("app_metadata", timestamp_unix))
            .pipe(|b| augment.augment_data_point(b))
            .field("payload", payload.clone())
            .field("type", r#type as u64)
            .build()?;

        Ok(vec![result])
    }
}
