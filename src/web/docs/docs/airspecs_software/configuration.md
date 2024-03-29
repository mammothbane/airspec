# Configuration
Each sensor channel on AirSpecs can be configured to suite specific applications. Below, we define what can be configured for each sensor channel and how. 

## Packet Structure
Our system uses Protocol Buffers to send data to and from the glasses. To update the system state, we use the AirSpecConfigPacket protobuf message structure as shown below.

- **LightControlPacket** is used if wanting to manipulate the lights on the glasses
- **SensorControl** is used to activate/deactivate sensor channels and to synchronize windowed sensor channels (i.e., IMU and blink sensing). 
- **SensorConfig** is used to define settings for specific sensor subsystems. 
- **DFU_Mode** is used to put the system into Direct Firmware Update mode where you will be able to connect to the glasses via a USB cable and using [STM32CubeProg](https://www.st.com/en/development-tools/stm32cubeprog.html) programming software to flash new firmware
- _note: additional modes may be added for specific applications_

```
message AirSpecConfigHeader{
    uint64 timestamp_unix = 1;
}

message AirSpecConfigPacket {
    AirSpecConfigHeader header = 1;

    oneof payload {
        LightControlPacket ctrl_indiv_led = 2;
        SensorControl sensor_control = 3;
        SensorConfig sensor_config = 4;
        DFU_Mode    dfu_mode = 5;
        BlueGreenTransition blueGreenTransition = 6;
        RedFlashTask redFlashTask = 7;
	BlinkCalibration blinkCalibration = 8;
    }
}
```
### Light Control Packet
A **LightControlPacket** can be sent to change the color of any of the LEDs. Valid values are in the range 0 to 255 where 255 is the maximum intensity of any given color (i.e., red, green, and blue). If the glasses disconnect from Bluetooth, the LEDs will reset. 
```
message AirSpecColors{
    uint32 red = 1;
    uint32 green = 2;
    uint32 blue = 3;
}

message AirSpecColorPosition{
    AirSpecColors forward = 1;
    AirSpecColors eye = 2;
    AirSpecColors top = 3;
}

message LightControlPacket {
    AirSpecColorPosition left = 1;
    AirSpecColorPosition right = 2;
}
```

### Sensor Control
Any sensor channel can be enabled or disabled by defining the SensorControl submessage and setting the correct boolean value. 

The IMU and blink detection subsystems can be configured to be sampled at specific periods for spefic durations (i.e., windowed). This reduces the power consumption and data rate of the overall system so its often preferred. To enable this feature, you need to set "enable_windowing" to **true** for each of those subsystem individually (explained in the Sensor Configuration section). If windowing both IMU and blink channels,  it may be preferred to synchronize those channels with eachother. To do that, you can set "synchronize_windows" to **true** in the Sensor Control message and define how long is the window (window_size_ms) and how often to window (window_period_ms). 

_note: window_size_ms and window_period_ms will override any window size and period settings within the individual sensor channel configurations_
```
message SensorControl{
    bool enable_all = 1;
    bool spectrometer = 2;
    bool bme688 = 3;
    bool imu = 4;
    bool thermopiles = 5;
    bool lux = 6;
    bool mic = 7;
    bool sht = 8;
    bool sgp = 9;
    bool blink = 10;
    bool synchronize_windows = 11;
    uint32 window_size_ms = 12;
    uint32 window_period_ms = 13;
}
```

### Sensor Config
Further expansion of the message structure can be found [here](https://github.com/pchwalek/env_glasses/blob/main/protobuf/message.proto)
```
message SensorConfig{
    LuxSensorConfig lux = 1;
    SGP_Sensor_Config sgp = 2;
    BME_Sensor_Config bme = 3;
    ColorSensorConfig color = 4;
    ThermopileSensorConfig thermopile = 5;
    BlinkSensorConfig blink = 6;
    MicSensorConfig mic = 7;
    HumiditySensorConfig humidity = 8;
    IMU_SensorConfig imu = 9;
}
```

#### Lux Sensor 
Datasheet: [TSL27721](https://ams.com/documents/20143/9935604/TSL2772_DS000181_3-00.pdf)

| Configurable Parameters | Type |Description | 
| ------ | ------ | ------ | 
| sample_period_ms | uint32_t | sample period (milliseconds) |
| gain | [Tsl2591Gain](https://github.com/pchwalek/env_glasses/blob/main/protobuf/message.proto#L24) | gain of sensor |
| integration_time | [Tsl2591IntegrationTime](https://github.com/pchwalek/env_glasses/blob/main/protobuf/message.proto#L24) | integration time of sensor |

#### SGP41 Sensor 
Datasheet: [SGP41](https://sensirion.com/media/documents/5FE8673C/61E96F50/Sensirion_Gas_Sensors_Datasheet_SGP41.pdf)

| Configurable Parameters | Type |Description | 
| ------ | ------ | ------ | 
| sample_period_ms | uint32_t | sample period (milliseconds) |

#### BME688 Sensor 
Datasheet: [BME688](https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bme688-ds000.pdf)

| Configurable Parameters | Type |Description | 
| ------ | ------ | ------ | 
| sample_period_ms | uint32_t | sample period (milliseconds) |

#### Color Sensor (Spectrometer)
Datasheet: [AS7341](https://media.digikey.com/pdf/Data%20Sheets/Austriamicrosystems%20PDFs/AS7341_DS.pdf)

| Configurable Parameters | Type |Description | 
| ------ | ------ | ------ | 
| sample_period_ms | uint32_t | sample period (milliseconds) |
| integration_time | uint32_t | intergation time |
| integration_step | uint32_t | integration step |
| gain | [Spec_gain](https://github.com/pchwalek/env_glasses/blob/main/protobuf/message.proto#L91) | gain of sensor |

#### Skin Temperature Sensors (Thermopiles)
Datasheet: [TPIS 1S 1385](https://media.digikey.com/pdf/Data%20Sheets/Excelitas%20PDFs/TPiS_1S_1385.pdf)

| Configurable Parameters | Type |Description | 
| ------ | ------ | ------ | 
| sample_period_ms | uint32_t | sample period (milliseconds) |
| enable_top_of_nose | bool | enable/disable nose temperature |
| enable_nose_bridge | bool | enable/disable nose bridge skin temperature |
| enable_front_temple | bool | enable/disable front temple skin temperature |
| enable_mid_temple | bool | enable/disable mid temple skin temperature |
| enable_rear_temple | bool | enable/disable rear temple skin temperature |

#### Blink Sensor 
| Configurable Parameters | Type |Description | 
| ------ | ------ | ------ | 
| sample_frequency | uint32_t | sample frequency (hz) |
| enable_daylight_compensation | bool | disable diode if sunlight is detected to reduce risk of saturation |
| daylightCompensationUpperThresh | uint32_t | upper threshold for schmit trigger daylight detection |
| daylightCompensationLowerThresh | uint32_t | lower threshold for schmit trigger daylight detection |
| enable_windowing | uint32_t | enable sample windowing (disable continous mode) |
| enable_windowing_sync | not used | not used |
| window_size_ms | uint32_t | sample window size (milliseconds) |
| window_period_ms | uint32_t | sample window period (milliseconds) |

#### Microphone  
Datasheet: [ICS-43434](https://invensense.tdk.com/wp-content/uploads/2016/02/DS-000069-ICS-43434-v1.2.pdf?ref_disty=digikey)

| Configurable Parameters | Type |Description | 
| ------ | ------ | ------ | 
| sample_period_ms | uint32_t | sample period (milliseconds) |
| mic_sample_freq | uint32_t | sample frequency (hz) |

#### Ambient Temperature/Humidity Sensor 
Datasheet: [SHT45](https://sensirion.com/media/documents/33FD6951/63E1087C/Datasheet_SHT4x_1.pdf)

| Configurable Parameters | Type |Description | 
| ------ | ------ | ------ | 
| sample_period_ms | uint32_t | sample period (milliseconds) |
| gain | [Sht45_precision](https://github.com/pchwalek/env_glasses/blob/main/protobuf/message.proto#L39) | precision |
| integration_time | [Sht45_heater](https://github.com/pchwalek/env_glasses/blob/main/protobuf/message.proto#L46) | heater power level and duration |

#### IMU Sensor 
Datasheet: [ICM-20948](https://invensense.tdk.com/download-pdf/icm-20948-datasheet/)

| Configurable Parameters | Type |Description | 
| ------ | ------ | ------ | 
| accelerometer settings | [IMU_Accel_Settings](https://github.com/pchwalek/env_glasses/blob/main/protobuf/message.proto#L320) | settings for low pass filter, range, and sample frequency |
| gyro settings | [IMU_Gyro_Settings](https://github.com/pchwalek/env_glasses/blob/main/protobuf/message.proto#L326) | settings for low pass filter, range, and sample frequency |
| enable_windowing | uint32_t | enable sample windowing (disable continous mode) |
| enable_windowing_sync | not used | not used |
| window_size_ms | uint32_t | sample window size (milliseconds) |
| window_period_ms | uint32_t | sample window period (milliseconds) |

### DFU Mode
DFU mode can be enabled by sending a **AirSpecConfigPacket** with **DFU_mode** defined and **enable** set to true.
```
message DFU_Mode{
    bool enable = 1;
}
```