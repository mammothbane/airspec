import _ from 'lodash';
import * as Plot from '@observablehq/plot';

import { Box, Switch, Typography } from '@mui/material';

import { useAirspecsSelector } from '../../../store';

import { Config } from './Config';
import { selectSensorData } from '../slice';
import { SensorType, to_packet_type } from '../types';
import {useEffect, useMemo, useRef, useState} from "react";
import type {Datum, PlotData} from "plotly.js";


type Props = {
  type: SensorType,
  onEnable: (st: SensorType, enable: boolean, enablement: SensorType[]) => Promise<void>,
  onPropChange: (st: SensorType, key: string, value: any) => Promise<void>,
};

type PlotProps ={
  sensor_type: SensorType,
  update_rate_ms?: number,
  max_wait?: number,
  show_legend?: boolean,
};

type Point = {
  x: Datum,
  y: Datum,
  name?: string,
};

type Series = Point[];

export const EMPTY = [];

/**
 * Separated component to keep rerenders minimal for redux updates.
 */
const PlotWrap = ({
  sensor_type,
  update_rate_ms = 1000 * 4 / 60,
  max_wait = update_rate_ms * 4,
  show_legend = true,
}: PlotProps) => {
  const packet_types = to_packet_type(sensor_type);

  const sensor_data: Partial<PlotData>[][] = useAirspecsSelector(state => selectSensorData(state, packet_types));

  const ref = useRef<null | HTMLDivElement>(null);

  const [dat, setDat] = useState([] as Series[]);

  const throttledUpdate = useMemo(() => _.debounce((sensor_data: any) => {
    if (sensor_data.length === 0) {
      setDat(EMPTY);
      return;
    }

    const datas = sensor_data.map(
      (sensor_type_data: Partial<PlotData>[]) => sensor_type_data.flatMap(
        ({x: xs, y: ys, name}) => {
          return (xs as Datum[]).map(
            (x, i) => ({
              x,
              y: (ys as Datum[])[i],
              name,
            }));
        }
      )
    );

    setDat(datas);
  },  update_rate_ms, {
    leading: true,
    trailing: true,
    maxWait: max_wait,
  }), [update_rate_ms, max_wait]);

  useEffect(() => throttledUpdate(sensor_data), [sensor_data])

  useEffect(() => {
    const plots = dat.map(subtype => {
      const marks = [
        Plot.axisX({ticks: 0, label: null}),
        Plot.axisY({ticks: 0, label: null}),

        Plot.line(subtype, {x: 'x', y: 'y', sort: 'x', curve: 'monotone-x', stroke: 'name'}),
        Plot.crosshair(subtype, {x: 'x', y: 'y', sort: 'x', stroke: 'name'}),
      ];

      return Plot.plot({
        x: {},
        color: {legend: subtype.length > 0 && show_legend, scheme: 'tableau10'},
        marks,
      });
    }, [show_legend]);

    plots.forEach(plot => {
      ref.current?.append(plot);
    });

    return () => plots.forEach(plot => plot.remove());
  } ,[dat, show_legend]);

  return <div ref={ref}/>;
}

const EnableSwitch = ({ type, onEnable }: Omit<Props, 'onPropChange'>) => {
  const enablement = useAirspecsSelector(state => state.bluetooth.system_enablement);
  const enabled = enablement.includes(type);

  return <Switch
    checked={enabled}
    onChange={async (_evt, value) => await onEnable(type, value, enablement)}
  />;
}

export const Sensor = ({
                         type,
                         onEnable,
                         onPropChange,
                       }: Props) => {
  const show_graph = useAirspecsSelector(state => state.bluetooth.show_graphs);

  return <Box sx={{
    p: 2,
    background: '#f8f8f8',
    width: 400,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  }}>
    <Box sx={{
      display: 'flex',
      alignItems: 'baseline',
    }}>
      <Typography variant={'h2'}>
        {type?.replace(/Packet$/, '')}
      </Typography>

      <Box sx={{
        flexGrow: 1,
      }}/>

      <EnableSwitch type={type} onEnable={onEnable}/>
    </Box>

    {show_graph ?
      <PlotWrap
        sensor_type={type}
        show_legend={!['lux'].includes(type)}
        update_rate_ms={['blink', 'imu'].includes(type) ? 1000 * 2.5 / 60 : 1000 * 10 / 60}
      /> :
      undefined
    }

    <Config
      type={type}
      onChange={async (k, v) => await onPropChange(type, k, v)}
    />
  </Box>;
};
