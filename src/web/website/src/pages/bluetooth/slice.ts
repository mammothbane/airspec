import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';
import { Datum, PlotData } from 'plotly.js';
import { RootState } from '../../store';
import { SensorPacket_Payload } from './types';
import {holes} from "../../util";

export type SensorData = {
  sensor: SensorPacket_Payload,
  data: Partial<PlotData>[],
}

export type State = {
  sensor_data: Partial<Record<SensorPacket_Payload, Partial<PlotData>[]>>,
  submit_queue: Record<string, any>[],
  last_old_data_ts?: number,
}

const MAX_PTS = 5000;
const MAX_AGE = 1000 * 60 * 60 * 24 * 30 * 6;

const DEBUG_AGE = false;

export const slice = createSlice({
  name: 'bluetooth_state',
  initialState: {
    sensor_data: {},
    submit_queue: [],
  } as State,
  reducers: {
    record_sensor_data: (state: Draft<State>, action: PayloadAction<SensorData>) => {
      if (state.sensor_data[action.payload.sensor] == null) {
        state.sensor_data[action.payload.sensor] = action.payload.data;

        state.sensor_data[action.payload.sensor]?.forEach(elt => {
          if (elt.x != null) elt.x = [];
          if (elt.y != null) elt.y = [];
          if (elt.z != null) elt.z = [];
        });
      }

      const current_record: Draft<Partial<PlotData>>[] = state.sensor_data[action.payload.sensor]!;

      const now = Date.now();
      const oldest = now - MAX_AGE;

      action.payload.data.forEach((data, i) => {
        let dates = (data.x as number[]).map(n => new Date(n));
        let ys = Array.from(data.y as Datum[]);
        let zs = Array.from((data.z ?? []) as Datum[]);

        const inRangeIndices = dates.map((d, i) => Number(d) >= oldest ? i : -1).filter(i => i >= 0);

        if (inRangeIndices.length !== dates.length) {
          console.warn('dropping data for being too old', {
            nElements: dates.length - inRangeIndices.length,
            droppedDates: dates.filter((_, i) => !(i in inRangeIndices)),
          });

          state.last_old_data_ts = Date.now();
        }

        const dateHoles = holes(inRangeIndices, dates.length);

        if (DEBUG_AGE) console.debug({dateHoles, dates: Array.from(dates), ys: Array.from(ys), zs: Array.from(zs)});

        for (const [start, size] of dateHoles.reverse()) {
          dates.splice(start, size);
          ys.splice(start, size);
          zs.splice(start, size);
        }

        if (DEBUG_AGE) console.debug({dateHoles, dates: Array.from(dates), ys: Array.from(ys), zs: Array.from(zs)});

        const target = current_record[i];

        target.x = (target.x as Datum[]).concat(dates);
        target.y = (target.y as Datum[]).concat(ys);

        target.x = target.x.slice(Math.max(0, target.x.length - MAX_PTS));
        target.y = target.y.slice(Math.max(0, target.y.length - MAX_PTS));

        if (data.z) {
          target.z = ((target.z ?? []) as Datum[]).concat(zs);
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

export const selectOldPacketAgeMillis = (state: RootState): number | null => {
  const x = state.bluetooth.last_old_data_ts;

  if (x == null) return null;
  return Date.now() - x;
}
