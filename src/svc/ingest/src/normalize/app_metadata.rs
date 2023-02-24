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
            uid_phone,
            ref payload,
        } = *self;

        let result = DataPoint::builder("app_metadata")
            .pipe(|b| augment.augment_data_point(b))
            .field("payload", payload.clone())
            .tag("phone_uid", uid_phone.to_string())
            .build()?;

        Ok(vec![result])
    }
}
