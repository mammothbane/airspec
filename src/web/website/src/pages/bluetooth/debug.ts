import { AirSpecConfigPacket } from '../../../../../../proto/message.proto';

export const debug_led = (enabled: boolean, value: number = 0x80) : AirSpecConfigPacket => {
  value = value & 0xff;
  if (enabled) value = 0;

  return new AirSpecConfigPacket({
    header: {
      timestampUnix: Date.now(),
    },

    ctrlIndivLed: {
      left: {
        eye: {
          red: value,
          green: 0,
          blue: 0,
        },

        forward: {
          red: 0,
          green: 0,
          blue: value,
        },

        top: {
          red: 0,
          green: value,
          blue: 0,
        },
      },
      right: {
        eye: {
          red: 0,
          green: 0,
          blue: value,
        },

        forward: {
          red: 0,
          green: value,
          blue: 0,
        },

        top: {
          red: value,
          green: 0,
          blue: 0,
        },
      },
    },
  });
}
