import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';
import { Data, Datum, PlotData } from 'plotly.js';
import { SensorPacket } from '../../../../../../proto/message.proto';
import { RootState } from '../../store';
import { SensorPacket_Payload } from './types';

export type SensorData = {
  sensor: SensorPacket_Payload,
  data: Partial<PlotData>[],
}

export type State = {
  sensor_data: Partial<Record<SensorPacket_Payload, Partial<PlotData>[]>>,
  submit_queue: Record<string, any>[],
}

const MAX_PTS = 10000;

const EMPTY_ARRAY: Partial<PlotData>[] = [];

export const slice = createSlice({
  name: 'bluetooth_state',
  initialState: {
    sensor_data: {},
    submit_queue: [],
  } as State,
  reducers: {
    record_sensor_data: (state: Draft<State>, action: PayloadAction<SensorData>) => {
      const current_record: Partial<PlotData>[] | undefined = state.sensor_data[action.payload.sensor];

      if (current_record === undefined) {
        state.sensor_data[action.payload.sensor] = action.payload.data;
        return;
      }

      action.payload.data.map((data, i) => {
        const target = current_record[i];

        const dates = (data.x as number[]).map(n => new Date(n));

        target.x = (target.x as Datum[]).concat(dates);
        target.y = (target.y as Datum[]).concat(data.y as Datum[]);
        target.z = (target.z as Datum[] | undefined)?.concat(data.z! as Datum[]);

        target.x = target.x.slice(Math.max(0, target.x.length - MAX_PTS));
        target.y = target.y.slice(Math.max(0, target.y.length - MAX_PTS));
        target.z = target.z?.slice(Math.max(0, target.z?.length - MAX_PTS));
      })
    },
    record_packets: (state: Draft<State>, action: PayloadAction<Record<string, any>[]>) => {
      state.submit_queue = state.submit_queue.concat(action.payload);
    },
    clear_queue: (state: Draft<State>) => {
      state.submit_queue = [];
    },
  }
});

export const { record_sensor_data, record_packets, clear_queue } = slice.actions;
export const reducer = slice.reducer;

export const selectSensorData = (sensor: SensorPacket_Payload[]) => (state: RootState) => sensor.map(ty => state.bluetooth.sensor_data[ty] ?? EMPTY_ARRAY);
export const selectQueuedPackets = (state: RootState) => state.bluetooth.submit_queue;
