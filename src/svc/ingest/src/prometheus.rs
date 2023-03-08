use std::{
    future::Future,
    net::SocketAddr,
    pin::Pin,
};

use prometheus::Encoder;
use tide::{
    Body,
    Response,
};

use crate::{
    trace,
    util,
};

lazy_static::lazy_static! {
    static ref HTTP_REQUEST_RATE: prometheus::IntCounterVec = prometheus::register_int_counter_vec!("http_request_rate", "http request rate", &["path", "method", "status"]).unwrap();
    static ref HTTP_LATENCY: prometheus::HistogramVec = prometheus::register_histogram_vec!("http_latency", "http latency", &["path", "method"]).unwrap();
}

pub async fn serve_prometheus(bind: SocketAddr) -> eyre::Result<()> {
    let mut server = tide::new();

    server.with(trace::middleware).with(util::error_middleware);

    server.at("/metrics").get(metrics_endpoint);
    server.listen(bind).await?;

    Ok(())
}

pub async fn metrics_endpoint<State>(_request: tide::Request<State>) -> tide::Result {
    let encoder = prometheus::TextEncoder::new();
    let metric_families = prometheus::gather();

    let mut buffer = vec![];
    encoder.encode(&metric_families, &mut buffer)?;

    Ok(Response::builder(tide::StatusCode::Ok)
        .content_type(prometheus::TEXT_FORMAT)
        .body(Body::from_bytes(buffer))
        .build())
}

pub fn middleware<State>(
    req: tide::Request<State>,
    next: tide::Next<'_, State>,
) -> Pin<Box<dyn Future<Output = tide::Result> + Send + '_>>
where
    State: Clone + Send + Sync + 'static,
{
    Box::pin(async move {
        let path = req.url().path().to_owned();
        let method = req.method();

        let timer = HTTP_LATENCY
            .with(&prometheus::labels! {
                "path" => path.as_str(),
                "method" => method.as_ref(),
            })
            .start_timer();

        let resp = next.run(req).await;

        timer.stop_and_record();

        let status = resp.status().to_string();

        HTTP_REQUEST_RATE
            .with(&prometheus::labels! {
                "path" => path.as_str(),
                "method" => method.as_ref(),
                "status" => &status,
            })
            .inc();

        Ok(resp)
    })
}
