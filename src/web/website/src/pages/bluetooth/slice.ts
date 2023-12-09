import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';
import { Datum, PlotData } from 'plotly.js';
import _ from 'lodash';

import { RootState } from '../../store';
import {DEFAULT_ENABLED, SensorPacket_Payload, SensorType} from './types';
import {holes} from "../../util";

export type SensorData = {
  sensor: SensorPacket_Payload,
  data: Partial<PlotData>[],
}

export type State = {
  sensor_data: Partial<Record<SensorPacket_Payload, Partial<PlotData>[]>>,
  submit_queue: Record<string, any>[],
  last_old_data_ts?: number,
  system_enablement: SensorType[],
  api_key?: string,
}

const MAX_PTS = 5000;
const MAX_AGE = 1000 * 60 * 60 * 24 * 30 * 6;

const DEBUG_AGE = false;

function removeTooOld(
  dates: Date[],
  ys: (string | number | Date | null)[],
  zs: (string | number | Date | null)[],
  max_age: number,
  report_old: () => void,
) {
  const inRangeIndices = dates
    .map((d, i) => Number(d) >= max_age ? i : -1)
    .filter(i => i >= 0);

  if (inRangeIndices.length !== dates.length) {
    console.warn('dropping data for being too old', {
      nElements: dates.length - inRangeIndices.length,
      droppedDates: dates.filter((_, i) => !(inRangeIndices.includes(i))),
    });

    report_old();
  }

  const dateHoles = holes(inRangeIndices, dates.length);

  if (DEBUG_AGE) console.debug({
    dateHoles,
    dates: Array.from(dates),
    ys: Array.from(ys),
    zs: Array.from(zs)
  });

  for (const [start, size] of dateHoles.reverse()) {
    dates.splice(start, size);
    ys.splice(start, size);
    zs.splice(start, size);
  }

  if (DEBUG_AGE) console.debug({
    dateHoles,
    dates: Array.from(dates),
    ys: Array.from(ys),
    zs: Array.from(zs)
  });
}

export const mergePlotData = (
  target: Partial<PlotData>,
  data: Partial<PlotData>,
  clamp_length: number | null = null,
  max_age: number | null = null,
  report_old: () => void = () => {},
) => {
  let dates = (data.x as number[]).map(n => new Date(n));
  let ys = Array.from(data.y as Datum[]);
  let zs = Array.from((data.z ?? []) as Datum[]);

  if (max_age != null) {
    removeTooOld(dates, ys, zs, max_age, report_old);
  }

  target.x = (target.x as Datum[]).concat(dates);
  target.y = (target.y as Datum[]).concat(ys);

  if (clamp_length != null) {
    target.x = target.x.slice(Math.max(0, target.x.length - clamp_length));
    target.y = target.y.slice(Math.max(0, target.y.length - clamp_length));
  }

  if (data.z) {
    target.z = ((target.z ?? []) as Datum[]).concat(zs);

    if (clamp_length != null) {
      target.z = (target.z as Datum[]).slice(Math.max(0, target.z!.length - clamp_length)) ?? null;
    }
  }
};

export const mergePlotDatas = (old: Partial<PlotData>[], nu: Partial<PlotData>[]) => {
  nu.forEach((data, i) => {
    mergePlotData(old[i], data);
  });
};

export const slice = createSlice({
  name: 'bluetooth_state',
  initialState: {
    sensor_data: {},
    submit_queue: [],
    system_enablement: Array.from(DEFAULT_ENABLED),
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

      let working_max = MAX_PTS;
      if (action.payload.sensor === 'imuPacket') {
        working_max = 64;
      }

      action.payload.data.forEach((data, i) => {
        let dates = (data.x as number[]).map(n => new Date(n));
        let ys = Array.from(data.y as Datum[]);
        let zs = Array.from((data.z ?? []) as Datum[]);

        const inRangeIndices = dates.map((d, i) => Number(d) >= oldest ? i : -1).filter(i => i >= 0);

        if (inRangeIndices.length !== dates.length) {
          console.warn('dropping data for being too old', {
            nElements: dates.length - inRangeIndices.length,
            droppedDates: dates.filter((_, i) => !(inRangeIndices.includes(i))),
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

        target.x = target.x.slice(Math.max(0, target.x.length - working_max));
        target.y = target.y.slice(Math.max(0, target.y.length - working_max));

        if (data.z) {
          target.z = ((target.z ?? []) as Datum[]).concat(zs);
          target.z = (target.z as Datum[]).slice(Math.max(0, target.z!.length - working_max)) ?? null;
        }
      })
    },

    record_packets: (state: Draft<State>, action: PayloadAction<Record<string, any>[]>) => {
      state.submit_queue = state.submit_queue.concat(action.payload);
    },

    clear_queue: (state: Draft<State>) => {
      state.submit_queue = [];
    },

    set_complete_system_enablement: (state: Draft<State>, action: PayloadAction<SensorType[]>) => {
      state.system_enablement = action.payload;
    },

    set_system_enablement: (state: Draft<State>, action: PayloadAction<[SensorType[], boolean]>) => {
      if (state.system_enablement == null) {
        console.warn('unable to enable system: no known enablement');
        return;
      }

      const [types, enable] = action.payload;

      if (enable) state.system_enablement = _.union(types);
      else state.system_enablement = _.intersection(types);
    },
  }
});

export const {
  record_sensor_data,
  record_packets,
  clear_queue,
  set_complete_system_enablement,
  set_system_enablement,
} = slice.actions;
export const reducer = slice.reducer;

const EMPTY: Partial<PlotData>[] = [];

export const selectSensorData = (sensor: SensorPacket_Payload[]) => (state: RootState) => sensor.map(ty => state.bluetooth.sensor_data[ty] ?? EMPTY);
export const selectQueuedPackets = (state: RootState) => state.bluetooth.submit_queue;

export const selectOldPacketAgeMillis = (state: RootState): number | null => {
  const x = state.bluetooth.last_old_data_ts;

  if (x == null) return null;
  return Date.now() - x;
}
