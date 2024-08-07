import {createSelector, createSlice, Draft, PayloadAction} from '@reduxjs/toolkit';
import { Datum, PlotData } from 'plotly.js';
import _ from 'lodash';

import {RootState} from '../../store';
import {DEFAULT_ENABLED, SensorPacket_Payload, SensorType} from './types';
import {holes} from "../../util";

export type SensorData = {
  sensor: SensorPacket_Payload,
  data: Partial<PlotData>[],
}

export type State = {
  sensor_data: Partial<Record<SensorPacket_Payload, Partial<PlotData>[]>>,
  submit_queue: number[][],
  last_old_data_ts?: number,
  system_enablement: SensorType[],
  api_key?: string,
  streaming: boolean,
  config?: { [key: string]: any },
  requested_state_changes: { [key: string ]: any },
  seen_glasses: string[],
  show_graphs: boolean,
}

const MAX_PTS = 300;
const MAX_AGE = 1000 * 60 * 60 * 24 * 30 * 6;

const DEBUG_AGE = false;

export const SEEN_GLASSES_LOCALSTORAGE_KEY = 'SEEN_GLASSES';
const seen_glasses_init_str = localStorage.getItem(SEEN_GLASSES_LOCALSTORAGE_KEY) ?? '';

let seen_glasses_init = [];
if (seen_glasses_init_str !== '') {
  seen_glasses_init = JSON.parse(seen_glasses_init_str);
}

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

  const pairs: [keyof PlotData, Datum[]][] = [['x', dates], ['y', ys]];
  if (data.z) {
    pairs.push(['z', zs]);
  }

  pairs.forEach(([key, data]) => {
    // @ts-ignore
    if (!(key in target)) target[key] = [];
    const targetData = target[key] as Datum[];

    targetData.push(...(data as Datum[]));

    if (clamp_length != null) targetData.splice(0,targetData.length - clamp_length);
  });
};

export const slice = createSlice({
  name: 'bluetooth_state',
  initialState: {
    sensor_data: {},
    submit_queue: [],
    system_enablement: Array.from(DEFAULT_ENABLED),
    requested_state_changes: {},
    streaming: false,
    seen_glasses: seen_glasses_init ?? [],
    show_graphs: true,
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
        const target = current_record[i];

        mergePlotData(target as Partial<PlotData>, data, working_max, oldest, () => state.last_old_data_ts = Date.now());
      });
    },

    record_packets: (state: Draft<State>, action: PayloadAction<number[][]>) => {
      state.submit_queue.push(...action.payload);
    },

    clear_queue: (state: Draft<State>) => {
      state.submit_queue.splice(0);
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

    set_config: (state: Draft<State>, action: PayloadAction<{ [key: string]: any }>) => {
      state.config = action.payload;
      state.requested_state_changes = {};
    },

    push_requested_state_changes: (state: Draft<State>, action: PayloadAction<{ [key: string]: any }>) => {
      _.merge(state.requested_state_changes, action.payload);
    },

    register_glasses_id: (state: Draft<State>, action: PayloadAction<string>) => {
      state.seen_glasses.unshift(action.payload);
      state.seen_glasses = _.uniq(state.seen_glasses);
    },

    set_api_key: (state: Draft<State>, action: PayloadAction<string>) => {
      state.api_key = action.payload;
    },

    set_streaming: (state: Draft<State>, action: PayloadAction<boolean>) => {
      state.streaming = action.payload;
    },

    set_show_graphs: (state: Draft<State>, action: PayloadAction<boolean>) => {
      state.show_graphs = action.payload;
    },
  }
});

export const {
  record_sensor_data,
  record_packets,
  clear_queue,
  set_complete_system_enablement,
  set_system_enablement,
  set_config,
  push_requested_state_changes,
  register_glasses_id,
  set_api_key,
  set_streaming,
  set_show_graphs,
} = slice.actions;
export const reducer = slice.reducer;

const EMPTY: Partial<PlotData>[] = [];


export const selectAllSensorData = (state: RootState) => state.bluetooth.sensor_data;

export const selectSensorData = createSelector([
    selectAllSensorData,
    (state: RootState, sensor: SensorPacket_Payload[]) => sensor,
  ],
  (data, sensor) => {
    return sensor.map(ty => data[ty] ?? EMPTY);
  },
);

export const selectQueuedPackets = (state: RootState) => state.bluetooth.submit_queue;

export const selectOldPacketAgeMillis = (state: RootState): number | null => {
  const x = state.bluetooth.last_old_data_ts;

  if (x == null) return null;
  return Date.now() - x;
}

export const selectStreaming = (state: RootState) => state.bluetooth.streaming;
export const selectApiKey = (state: RootState) => state.bluetooth.api_key;
