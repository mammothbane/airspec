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
    fn to_data_points<T>(
        &self,
        _packet_epoch: Option<chrono::NaiveDateTime>,
        augment: &T,
    ) -> Result<Vec<DataPoint>, Error>
    where
        T: AugmentDatapoint,
    {
        let AppMetaDataPacket {
            ref payload,
        } = *self;

        let result = DataPoint::builder("app_metadata")
            .pipe(|b| augment.augment_data_point(b))
            .field("payload", payload.clone())
            .build()?;

        Ok(vec![result])
    }
}
