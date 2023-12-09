import _ from "lodash";
import {submit_packets} from "./util";
import {useAirspecsDispatch, useAirspecsSelector} from "../../store";
import {clear_queue, selectQueuedPackets} from "./slice";
import {useEffect} from "react";

const throttle_submit = _.throttle(submit_packets, 5000);

/**
 * Independent non-rendering component that submits packets as a job. Rendered in BluetoothControl.
 * Structured this way to avoid having the whole BluetoothControl tree rerender every time we
 * get new packets.
 */
export const WrapUpdatePackets = () => {
  const queued_packets = useAirspecsSelector(selectQueuedPackets);
  const [streaming, apiKey] = useAirspecsSelector(state => {
    const bt = state.bluetooth;

    return [bt.streaming, bt.api_key];
  });

  const dispatch = useAirspecsDispatch();

  useEffect(() => {
    throttle_submit(queued_packets, apiKey ?? '', streaming, () => dispatch(clear_queue()));
  }, [queued_packets, apiKey, streaming]); // eslint-disable-line react-hooks/exhaustive-deps

  return <></>;
};
