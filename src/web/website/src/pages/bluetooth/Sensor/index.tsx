import { Box, Switch, Typography } from '@mui/material';
import Plot from 'react-plotly.js';
import { MicSensorConfig } from '../../../../../../../proto/message.proto';
import { useAirspecsSelector } from '../../../store';

import { Config } from './Config';
import { selectSensorData } from '../slice';
import { SensorType, to_packet_type } from '../types';

type Props = {
  type: SensorType
  enabled: boolean,
  setEnabled: (enabled: boolean) => void,
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
  const sensor_data = useAirspecsSelector(selectSensorData(to_packet_type(sensor_type))) ?? [];

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
export const Sensor = ({
                         type,
                         enabled,
                         setEnabled,
                       }: Props) => {
  return <Box sx={{
    p: 2,
    background: '#fff',
    width: 400,
    display: 'grid',
    gap: 2,
    gridTemplateAreas: `
      'header'
    `,
  }}>
    <Box sx={{
      display: 'flex',
      alignItems: 'baseline',
      gridArea: 'header',
    }}>
      <Typography variant={'h2'}>
        {type?.replace(/Packet$/, '')}
      </Typography>

      <Box sx={{
        flexGrow: 1,
      }}/>

      <Switch
        checked={enabled}
        onChange={(_evt, value) => setEnabled(value)}
      />
    </Box>

    <Config
      type={type}
      config={new MicSensorConfig({
        samplePeriodMs: 4,
        micSampleFreq: 4,
      })}
    />

    <PlotWrap sensor_type={type}/>
  </Box>;
};
