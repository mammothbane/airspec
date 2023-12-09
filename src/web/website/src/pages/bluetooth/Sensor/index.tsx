import { Box, Switch, Typography } from '@mui/material';
import Plot from 'react-plotly.js';
import { useAirspecsSelector } from '../../../store';
import {LineChart, XAxis, YAxis, Line, Tooltip } from 'recharts';

import { Config } from './Config';
import { selectSensorData } from '../slice';
import { SensorType, to_packet_type } from '../types';
import {PlotData} from "plotly.js";

type Props = {
  type: SensorType,
  onEnable: (st: SensorType, enable: boolean, enablement: SensorType[]) => Promise<void>,
  onPropChange: (st: SensorType, key: string, value: any) => Promise<void>,
};

type PlotProps ={
  sensor_type: SensorType,
};


/**
 * Separated component to keep rerenders minimal for redux updates.
 */
const PlotWrap = ({
  sensor_type,
}: PlotProps) => {
  const packet_types = to_packet_type(sensor_type);
  const sensor_data = useAirspecsSelector(state => selectSensorData(state, packet_types));

  let x: PlotData;

  if (sensor_data.length === 0) return <></>;

  const data = sensor_data[0];

  if (data.length === 0) return <></>;

  // @ts-ignore
  const dat = data[0].x.map((x: any, i: any) => ({x, y: data[0].y[i] }));

  //@ts-ignore
  return <LineChart height={240} width={300} data={dat}>
    <XAxis dataKey="x" axisLine={false} tick={false}/>
    <YAxis axisLine={false} tick={{
      fontSize: '0.75rem'
    }}/>

    <Tooltip contentStyle={{
      fontSize: '0.75rem'
    }} formatter={(value) => (value as any).toFixed(2).toString()}/>

    <Line type="monotone" dataKey={'y'} dot={false}/>
  </LineChart>;

  return <>
    {sensor_data.map((data) => {
      if (data.length === 0) return undefined;

      // @ts-ignore
      const dat = data[0].x.map((x: any, i: any) => ({x, y: data[0].y[i] }));

      // @ts-ignore
      return <LineChart width={300} height={240} data={dat}>
        <XAxis dataKey="x" hide={true}/>
        <YAxis hide={true}/>


        <Line type="monotone" dataKey={'y'} dot={false}/>
      </LineChart>;
    })}
  </>;

  return <>
    {sensor_data.map((data, i) => <Plot
      key={`${sensor_type}_${i}`}
      layout={{
        yaxis: {
          rangemode: 'tozero',
          showticklabels: false,
          showgrid: false,
          showline: false,
          visible: false,
        },

        xaxis: {
          showgrid: false,
          showticklabels: false,
          visible: false,
        },

        autosize: true,
        margin: {
          l: 8,
          r: 8,
          b: 8,
          t: 8,
          pad: 0,
        },
        modebar: {},
        annotations: [],
        height: 240,
      }}
      data={data}
      config={{
        displayModeBar: false,
        displaylogo: false,
      }}
    />)
    }
  </>
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
