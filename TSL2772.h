/*!
 *  @file TSL2772.h

 *  author: Patrick Chwalek
 */


#ifndef _TSL2772_H
#define _TSL2772_H

#ifdef __cplusplus
extern "C" {
#endif

#include "stm32wbxx_hal.h"

#define TSL2772_I2CADDR 0x39

typedef enum {
  TSL2722_GAIN_1X 	= 0x00,  /// low gain (1x)
  TSL2722_GAIN_8X 	= 0x01,  /// medium gain (25x)
  TSL2722_GAIN_16X 	= 0x02, /// medium gain (428x)
  TSL2722_GAIN_120X = 0x03,  /// max gain (9876x)
} tsl2591Gain_t;

typedef enum {
  TSL2722_INTEGRATIONTIME_2_73MS 	= 0xFF, // 2.73 millis
  TSL2722_INTEGRATIONTIME_27_3MS 	= 0xF6, // 27.3 millis
  TSL2722_INTEGRATIONTIME_101MS 	= 0xDB, // 101 millis
  TSL2722_INTEGRATIONTIME_175MS 	= 0xC0, // 175 millis
  TSL2722_INTEGRATIONTIME_600MS 	= 0x00, // 699 millis
} tsl2591IntegrationTime_t;

	class TSL2772;

	/*!
	 *    @brief  Class that stores state and functions for interacting with
	 *            the AS7341 11-Channel Spectral Sensor
	 */
	class TSL2772 {
	public:
		TSL2772();
		~TSL2772();

		bool begin(uint8_t i2c_addr = TSL2772_I2CADDR, I2C_HandleTypeDef *i2c_handle = 0);

		bool setATIME(tsl2591IntegrationTime_t atime_value); //ALS integration time
		bool setAGAIN(tsl2591Gain_t gain_value);

		tsl2591IntegrationTime_t getATIME();
		tsl2591Gain_t getAGAIN();

		bool enableALS_GainScaling(bool state);

//		bool enableAutoInc(bool state);
		bool enableALS(bool state);
		bool powerOn(bool state);

		bool reset(void);

		void readALS_data();
		uint32_t getLux();

		bool _init();
	protected:

		I2C_HandleTypeDef *i2c_han = NULL;///< Pointer to I2C bus interface
		uint8_t i2c_addr = 0;

	private:
		uint16_t _C0DATA;
		uint16_t _C1DATA;
		uint8_t als_gain_scaler = 0; // AGL field of Configuration Register (0x0D)
		float als_gain = 1;
		float als_integration_time_ms = 2.73;
		uint32_t _GA = 1; // this value is 1 if in open air (see pg 18 of datasheet)



		bool writeRegister(uint8_t mem_addr, uint8_t *val, uint16_t size);
		bool writeRegisterByte(uint8_t mem_addr, uint8_t val);
		bool modifyRegisterBit(uint16_t reg, bool value, uint8_t pos);
		uint8_t checkRegisterBit(uint16_t reg, uint8_t pos);
		uint8_t modifyBitInByte(uint8_t var, uint8_t value, uint8_t pos);
		bool modifyRegisterMultipleBit(uint16_t reg, uint8_t value, uint8_t pos, uint8_t bits);
		bool readRegisterBytes(uint16_t mem_addr, uint8_t *data, uint16_t num_bytes);
		bool readRegister(uint16_t mem_addr, uint8_t *dest, uint16_t size);
		uint8_t readRegisterByte(uint16_t mem_addr);

	};

#ifdef __cplusplus
}
#endif

#endif
