//! An adaptor that chunks up completed futures in a stream and flushes them after a timeout or when
//! the buffer is full (if a capacity is provided).
//!
//! It is based on the `ChunksTimeout` adaptor of
//! [futures-batch](https://github.com/mre/futures-batch), which has been altered to:
//!
//! - produce empty stream items whenever the timeout fires
//! - eliminate clock drift

use core::{
    mem,
    pin::Pin,
};
use std::time::{
    Duration,
    Instant,
};

use futures::{
    stream::{
        Fuse,
        FusedStream,
        Stream,
    },
    task::{
        Context,
        Poll,
    },
    Future,
    StreamExt,
};
use futures_timer::Delay;
use pin_utils::{
    unsafe_pinned,
    unsafe_unpinned,
};

/// A Stream extension trait allowing you to call `chunks_timeout` on anything
/// which implements `Stream`.
pub trait ChunksTimeoutStreamExt: Stream {
    fn chunks_timeout(self, capacity: Option<usize>, duration: Duration) -> ChunksTimeout<Self>
    where
        Self: Sized,
    {
        ChunksTimeout::new(self, capacity, duration)
    }
}
impl<T: ?Sized> ChunksTimeoutStreamExt for T where T: Stream {}

/// A Stream of chunks.
#[derive(Debug)]
#[must_use = "streams do nothing unless polled"]
pub struct ChunksTimeout<St: Stream> {
    stream:       Fuse<St>,
    items:        Vec<St::Item>,
    cap:          Option<usize>,
    // https://github.com/rust-lang-nursery/futures-rs/issues/1475
    clock:        Option<Delay>,
    last_timeout: Option<Instant>,
    duration:     Duration,
    done:         bool,
}

impl<St: Unpin + Stream> Unpin for ChunksTimeout<St> {}

impl<St: Stream> ChunksTimeout<St>
where
    St: Stream,
{
    unsafe_unpinned!(items: Vec<St::Item>);

    unsafe_unpinned!(done: bool);

    unsafe_unpinned!(last_timeout: Option<Instant>);

    unsafe_pinned!(clock: Option<Delay>);

    unsafe_pinned!(stream: Fuse<St>);

    pub fn new(stream: St, capacity: Option<usize>, duration: Duration) -> ChunksTimeout<St> {
        capacity.iter().for_each(|&cap| assert!(cap > 0));

        ChunksTimeout {
            stream: stream.fuse(),
            items: capacity.map(Vec::with_capacity).unwrap_or_else(Vec::new),
            cap: capacity,
            clock: None,
            duration,
            done: false,
            last_timeout: None,
        }
    }

    /// Consumes this combinator, returning the underlying stream.
    ///
    /// Note that this may discard intermediate state of this combinator, so care should be taken to
    /// avoid losing resources when this is called.
    #[inline]
    pub fn into_inner(self) -> St {
        self.stream.into_inner()
    }

    #[inline]
    fn take(mut self: Pin<&mut Self>) -> Vec<St::Item> {
        let cap = self.cap;
        mem::replace(self.as_mut().items(), cap.map(Vec::with_capacity).unwrap_or_else(Vec::new))
    }

    #[inline]
    fn clock_expired(self: &mut Pin<&mut Self>, cx: &mut Context<'_>) -> bool {
        self.as_mut().clock().as_pin_mut().unwrap().poll(cx).is_ready()
    }

    #[inline]
    fn reset_clock(self: &mut Pin<&mut Self>) {
        let next_timeout = self.last_timeout.unwrap() + self.duration;
        let dur = next_timeout - Instant::now();

        *self.as_mut().last_timeout() = Some(next_timeout);

        self.as_mut().clock().as_pin_mut().unwrap().reset(dur);
    }
}

impl<St: Stream> Stream for ChunksTimeout<St> {
    type Item = Vec<St::Item>;

    fn poll_next(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        if self.done {
            return Poll::Ready(None);
        }

        let dur = self.duration;

        // Only start the clock once we're polled -- we don't want to start the first timer at
        // construct-time.
        //
        // Corollaries/invariants:
        // - clock is None iff we have never been polled.
        // - clock and last_duration are not None after this block.
        {
            let mut clock = self.as_mut().clock();

            if clock.is_none() {
                *clock = Some(Delay::new(dur));
                *self.as_mut().last_timeout() = Some(Instant::now() + dur);
            }
        }

        // Pull items from the underlying stream and add to our buffer until the underlying stream
        // runs out.
        while let Poll::Ready(item) = self.as_mut().stream().poll_next(cx) {
            match item {
                Some(item) => {
                    self.as_mut().items().push(item);

                    // Return immediately if we're full to make room for new elements. We'll
                    // continue to add items from the underlying stream the next time our
                    // `poll_next` is called.
                    if let Some(cap) = self.cap {
                        if self.items.len() >= cap {
                            return Poll::Ready(Some(self.as_mut().take()));
                        }
                    }

                    continue;
                },

                // Underlying stream terminated permanently.
                None => {
                    *self.as_mut().done() = true;

                    let ret = self.as_mut().take();

                    return Poll::Ready(if !ret.is_empty() {
                        Some(self.as_mut().take())
                    } else {
                        None
                    });
                },
            }
        }

        if self.clock_expired(cx) {
            self.reset_clock();

            return Poll::Ready(Some(self.as_mut().take()));
        }

        Poll::Pending
    }

    #[inline]
    fn size_hint(&self) -> (usize, Option<usize>) {
        if self.done {
            return (0, Some(0));
        }

        // The upper limit on our number of items is unbounded per the contract of Stream -- we
        // produce empty vectors indefinitely as long as we're not `done` (checked previously).
        let (lower, _upper) = self.stream.size_hint();

        let pending_items = lower + self.items.len();

        let lower = match self.cap {
            // `pending_items` elements can be at minimum dispatched in n chunks of `cap` size.
            Some(cap) => pending_items.div_ceil(cap),

            // Iff `pending_items` is nonzero, then it will take us _at least_ one poll to dispatch
            // all of the elements (we could submit them all on the next call to `poll_next`).
            // Otherwise we *could* be done now.
            None => {
                if pending_items > 0 {
                    1
                } else {
                    0
                }
            },
        };

        (lower, None)
    }
}

impl<St: FusedStream> FusedStream for ChunksTimeout<St> {
    #[inline]
    fn is_terminated(&self) -> bool {
        self.done
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use async_std::*;

    #[async_std::test]
    async fn test() {
        const CHUNK: usize = 4;

        let results = stream::from_iter(0..1024)
            .chunks_timeout(Some(CHUNK), Duration::SECOND * 1024)
            .collect::<Vec<_>>()
            .await;

        let expect =
            (0..1024).collect::<Vec<_>>().chunks(CHUNK).map(|x| x.to_vec()).collect::<Vec<_>>();

        assert_eq!(expect, results);
    }
}
