import _ from 'lodash';
import * as Plot from '@observablehq/plot';

import { Box, Switch, Typography } from '@mui/material';

import { useAirspecsSelector } from '../../../store';

import { Config } from './Config';
import { selectSensorData } from '../slice';
import { SensorType, to_packet_type } from '../types';
import {useEffect, useMemo, useRef, useState} from "react";


type Props = {
  type: SensorType,
  onEnable: (st: SensorType, enable: boolean, enablement: SensorType[]) => Promise<void>,
  onPropChange: (st: SensorType, key: string, value: any) => Promise<void>,
};

type PlotProps ={
  sensor_type: SensorType,
  update_rate_ms?: number,
};

/**
 * Separated component to keep rerenders minimal for redux updates.
 */
const PlotWrap = ({
  sensor_type,
  update_rate_ms = 100
}: PlotProps) => {
  const packet_types = to_packet_type(sensor_type);
  const sensor_data = useAirspecsSelector(state => selectSensorData(state, packet_types));

  const ref = useRef<null | HTMLDivElement>(null);

  const [dat, setDat] = useState([] as any[]);

  const throttledUpdate = useMemo(() => _.debounce((sensor_data: any) => {
    if (sensor_data.length === 0 || sensor_data[0].length === 0) {
      setDat([]);
    } else {
      // @ts-ignore
      setDat(sensor_data[0][0].x.map((x: any, i: any) => ({x, y: sensor_data[0][0].y[i] })));
    }
  },  update_rate_ms, {
    leading: true,
    trailing: true,
    maxWait: update_rate_ms * 2,
  }), [update_rate_ms]);

  useEffect(() => throttledUpdate(sensor_data), [sensor_data, throttledUpdate])

  useEffect(() => {
    const plot = Plot.plot({
      x: {},
      y: {},
      color: {scheme: 'burd'},
      marks: [
        Plot.axisX({ticks: 0, label: null}),
        Plot.axisY({ticks: 0, label: null}),
        Plot.line(dat, {x: 'x', y: 'y', sort: 'x'}),
        Plot.crosshair(dat, {x: 'x', y: 'y', sort: 'x'}),
      ],
    });

    ref.current?.append(plot);

    return () => plot.remove();
  } ,[dat]);

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

    <Config
      type={type}
      onChange={async (k, v) => await onPropChange(type, k, v)}
    />

    <PlotWrap sensor_type={type}/>
  </Box>;
};
