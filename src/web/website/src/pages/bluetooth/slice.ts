import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';
import { Datum, PlotData } from 'plotly.js';
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

const MAX_PTS = 5000;

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

      action.payload.data.forEach((data, i) => {
        const target = current_record[i];

        const dates = (data.x as number[]).map(n => new Date(n));

        target.x = (target.x as Datum[]).concat(dates);
        target.y = (target.y as Datum[]).concat(data.y as Datum[]);

        target.x = target.x.slice(Math.max(0, target.x.length - MAX_PTS));
        target.y = target.y.slice(Math.max(0, target.y.length - MAX_PTS));

        if (data.z) {
          target.z = ((target.z ?? []) as Datum[]).concat(data.z! as Datum[]);
          target.z = (target.z as Datum[]).slice(Math.max(0, target.z!.length - MAX_PTS)) ?? null;
        }
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

export const selectSensorData = (sensor: SensorPacket_Payload[]) => (state: RootState) => sensor.map(ty => state.bluetooth.sensor_data[ty] ?? []);
export const selectQueuedPackets = (state: RootState) => state.bluetooth.submit_queue;
