use influxdb2::models::DataPoint;
use tap::Pipe;

use crate::{
    normalize::{
        rescale_timestamp,
        AugmentDatapoint,
        Error,
        ToDatapoints,
    },
    pb::{
        AppSurveyDataPacket,
        AppSurveyDataPayload,
    },
};

impl ToDatapoints for AppSurveyDataPacket {
    fn to_data_points<T>(&self, augment: &T) -> Result<Vec<DataPoint>, Error>
    where
        T: AugmentDatapoint,
    {
        let AppSurveyDataPacket {
            ref payload,
        } = *self;

        payload
            .iter()
            .map(
                |AppSurveyDataPayload {
                     q_choice,
                     q_index,
                     q_group_index,
                     timestamp_unix,
                 }| {
                    DataPoint::builder("survey")
                        .pipe(|b| augment.augment_data_point(b))
                        .timestamp(rescale_timestamp(*timestamp_unix))
                        .field("q_choice", q_choice.clone())
                        .field("q_index", *q_index as i64)
                        .field("q_group_index", *q_group_index as u64)
                        .field("timestamp_unix", *timestamp_unix)
                        .build()
                        .map_err(Error::from)
                },
            )
            .collect()
    }
}
