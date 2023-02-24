use influxdb2::models::DataPoint;
use tap::Pipe;

use crate::{
    normalize::{
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
            uid_phone,
            ref payload,
        } = *self;

        payload
            .iter()
            .map(
                |AppSurveyDataPayload {
                     q_choice,
                     q_index,
                 }| {
                    DataPoint::builder("survey")
                        .pipe(|b| augment.augment_data_point(b))
                        .field("q_choice", q_choice.clone())
                        .field("q_index", *q_index as i64)
                        .tag("phone_uid", uid_phone.to_string())
                        .build()
                        .map_err(Error::from)
                },
            )
            .collect()
    }
}
