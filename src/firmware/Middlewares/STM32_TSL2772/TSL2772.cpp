/*!
 *  @file TSL2772.cpp
 *
 * 	author: Patrick Chwalek
 */


#include "TSL2772.h"

#define TSL2722_ENABLE_REG	0x00
#define TSL2722_ATIME_REG	0x01
#define TSL2722_PTIME_REG	0x02
#define TSL2722_WTIME_REG	0x03
#define TSL2722_AILTL_REG	0x04
#define TSL2722_AILTH_REG	0x05
#define TSL2722_AIHTL_REG	0x06
#define TSL2722_AIHTH_REG	0x07
#define TSL2722_PILTL_REG	0x08
#define TSL2722_PILTH_REG	0x09
#define TSL2722_PIHTL_REG	0x0A
#define TSL2722_PIHTH_REG	0x0B
#define TSL2722_PERS_REG	0x0C
#define TSL2722_CONFIG_REG	0x0D
#define TSL2722_PPULSE_REG	0x0E
#define TSL2722_CONTROL_REG	0x0F
#define TSL2722_ID_REG		0x12
#define TSL2722_STATUS_REG	0x13
#define TSL2722_C0DATA_REG	0x14
#define TSL2722_C0DATAH_REG	0x15
#define TSL2722_C1DATA_REG	0x16
#define TSL2722_C1DATAH_REG	0x17
#define TSL2722_PDATAL_REG	0x18
#define TSL2722_PDATAH_REG	0x19
#define TSL2722_POFFSET_REG	0x1E


//command register
#define CMD_REG_W					0x01 << 7
#define CMD_REG_TYPE_REPEAT			0x00 << 5
#define CMD_REG_TYPE_AUTO_INC		0x01 << 5
#define CMD_REG_TYPE_SPECIAL		0x11 << 5
#define	CMD_REG_ADD_NORMAL			0x00
#define CMD_REG_ADD_PROX_CLR		0x05
#define CMD_REG_ADD_ALS_CLR			0x06
#define CMD_REG_ADD_PROX_ALS_CLR	0x07

//enable register
#define EN_REG_SAI					0x01 << 6
#define EN_REG_PIEN					0x01 << 5
#define EN_REG_AIEN					0x01 << 4
#define EN_REG_WEN					0x01 << 3
#define	EN_REG_PEN					0x01 << 2
#define EN_REG_AEN					0x01 << 1
#define EN_REG_PON					0x01

//ALS time register
#define ALS_REG_2_73_MS				0xFF
#define ALS_REG_27_3_MS				0xF6
#define ALS_REG_101_MS				0xDB
#define ALS_REG_175_MS				0xC0
#define ALS_REG_699_MS				0x00

//PROX time register
#define PROX_REG_2_73_MS			0xFF

// Wait Time Register
#define WTIME_REG_2_73_MS			0xFF
#define WTIME_REG_202_MS			0xB6
#define WTIME_REG_699_MS			0x00

// Configuration Register
#define CONFIG_REG_ALS_GAIN_SCALE_0_16 0x01 << 2
#define CONFIG_REG_ALS_GAIN_SCALE_1    0x00 << 2
#define CONFIG_REG_WAIT_12_X		   0x01 << 1
#define CONFIG_REG_WAIT_1_X		   	   0x00 << 1
#define CONFIG_REG_PROX_REDUCE_9	   0x01
#define CONFIG_REG_PROX_NO_REDUCE	   0x00

// Control Register
#define CTRL_REG_PDRIVE_120_MA		   	0x00 << 6
#define CTRL_REG_PDRIVE_60_MA		   	0x01 << 6
#define CTRL_REG_PDRIVE_30_MA			0x02 << 6
#define CTRL_REG_PDRIVE_15_MA			0x03 << 6
#define CTRL_REG_PDIODE_NONE			0x00 << 4
#define CTRL_REG_PDIODE_CH0				0x01 << 4
#define CTRL_REG_PDIODE_CH1				0x02 << 4
#define CTRL_REG_PGAIN_1X				0x00 << 2
#define CTRL_REG_PGAIN_2X				0x01 << 2
#define CTRL_REG_PGAIN_4X				0x02 << 2
#define CTRL_REG_PGAIN_8X				0x03 << 2
#define CTRL_REG_AGAIN_1X				0x00
#define CTRL_REG_AGAIN_8X				0x01
#define CTRL_REG_AGAIN_16X				0x02
#define CTRL_REG_AGAIN_120X				0x03

#define TSL27721_ALSPROX_DEV_ID			0x30

#define TSL27721_CMD_NORMAL				CMD_REG_W | CMD_REG_TYPE_AUTO_INC
/**
 * @brief Construct a new TSL2772::TSL2772 object
 *
 */
TSL2772::TSL2772(void) {
}

/**
 * @brief Destroy the TSL2772::TSL2772 object
 *
 */
TSL2772::~TSL2772(void) {
}

/*!
 *    @brief  Sets up the hardware and initializes I2C
 *    @param  i2c_address
 *            The I2C address to be used.
 *    @param  wire
 *            The Wire object to be used for I2C connections.
 *    @param  sensor_id
 *            The unique ID to differentiate the sensors from others
 *    @return True if initialization was successful, otherwise false.
 */
bool TSL2772::begin(uint8_t i2c_address, I2C_HandleTypeDef *i2c_handle) {

	i2c_han = i2c_handle;
	i2c_addr = i2c_address << 1;

	return _init();
}

/*!  @brief Initializer
 *   @returns True if chip identified and initialized
 */
bool TSL2772::_init() {
	uint8_t devid = readRegisterByte(TSL2722_ID_REG | TSL27721_CMD_NORMAL);

	// configure register autoincrement
	if (devid != TSL27721_ALSPROX_DEV_ID) return false;

	reset();

	return true;
}

bool TSL2772::reset(void) {
	return writeRegisterByte(TSL2722_ENABLE_REG, 0);
}


//bool TSL2772::enableAutoInc(bool state) {
//	uint8_t data = CMD_REG_W;
//
//	if(state) data |= CMD_REG_TYPE_AUTO_INC;
//
//	if(HAL_OK == HAL_I2C_Master_Transmit(i2c_han, i2c_addr, &data, 1, 10)){
//		return true;
//	}else{
//		return false;
//	}
//}

bool TSL2772::enableALS(bool state) {
	uint8_t enable_reg_data = readRegisterByte(TSL2722_ENABLE_REG | TSL27721_CMD_NORMAL);

	if(state) enable_reg_data |= EN_REG_AEN;
	else enable_reg_data &= !EN_REG_AEN;

	return writeRegisterByte(TSL2722_ENABLE_REG, enable_reg_data);
}

bool TSL2772::enableALS_GainScaling(bool state){
	uint8_t config_reg_data = readRegisterByte(TSL2722_CONFIG_REG | TSL27721_CMD_NORMAL);

	if(state){
		config_reg_data |= CONFIG_REG_ALS_GAIN_SCALE_0_16;
		als_gain_scaler = 1;
	}
	else{
		config_reg_data &= !CONFIG_REG_ALS_GAIN_SCALE_0_16;
		als_gain_scaler = 0;
	}

	return writeRegisterByte(TSL2722_CONFIG_REG, config_reg_data);
}

bool TSL2772::powerOn(bool state) {
	uint8_t enable_reg_data = readRegisterByte(TSL2722_ENABLE_REG | TSL27721_CMD_NORMAL);

	if(state) enable_reg_data |= EN_REG_PON;
	else enable_reg_data &= !EN_REG_PON;

	writeRegisterByte(TSL2722_ENABLE_REG, enable_reg_data);

	return 1;
}

bool TSL2772::setATIME(tsl2591IntegrationTime_t atime_value){
	uint8_t atime_reg_val = readRegisterByte(TSL2722_ATIME_REG | TSL27721_CMD_NORMAL);

	atime_reg_val = atime_value;

	switch(atime_value){
	case TSL2722_INTEGRATIONTIME_2_73MS:
		als_integration_time_ms = 2.73;
		break;
	case TSL2722_INTEGRATIONTIME_27_3MS:
		als_integration_time_ms = 27.33;
		break;
	case TSL2722_INTEGRATIONTIME_101MS:
		als_integration_time_ms = 101;
		break;
	case TSL2722_INTEGRATIONTIME_175MS:
		als_integration_time_ms = 175;
		break;
	case TSL2722_INTEGRATIONTIME_600MS:
		als_integration_time_ms = 600;
		break;
	default:
		break;
	}

	return writeRegisterByte(TSL2722_ATIME_REG, atime_reg_val);
}
bool TSL2772::setAGAIN(tsl2591Gain_t gain_value){

	uint8_t ctrl_reg_val = readRegisterByte(TSL2722_CONTROL_REG  | TSL27721_CMD_NORMAL) & 0xFC;

	ctrl_reg_val &= 0xFC;
	ctrl_reg_val |= gain_value;

	switch(gain_value){
	case TSL2722_GAIN_1X:
		als_gain = 1;
		break;
	case TSL2722_GAIN_8X:
		als_gain = 8;
		break;
	case TSL2722_GAIN_16X:
		als_gain = 16;
		break;
	case TSL2722_GAIN_120X:
		als_gain = 120;
		break;
	default:
		break;
	}

	if(als_gain_scaler) als_gain *= 0.16;

	return writeRegisterByte(TSL2722_CONTROL_REG, ctrl_reg_val);
}

tsl2591IntegrationTime_t TSL2772::getATIME(){
	return (tsl2591IntegrationTime_t) readRegisterByte(TSL2722_ATIME_REG | TSL27721_CMD_NORMAL);
}

tsl2591Gain_t TSL2772::getAGAIN(){
	return (tsl2591Gain_t) (readRegisterByte(TSL2722_CONTROL_REG | TSL27721_CMD_NORMAL) & 0xFC);
}

uint32_t TSL2772::getLux(){

	readALS_data(); // grab samples from sensor

	float _CPL; // counters per lux
	_CPL = (als_integration_time_ms * als_gain) / (_GA*60);
	float Lux1, Lux2;
	Lux1 = (1*_C0DATA - 1.87*_C1DATA)/_CPL;
	Lux2 = (0.63*_C0DATA - 1*_C1DATA)/_CPL;

	if( (Lux1>=Lux2) && (Lux1 > 0)){
		return Lux1;
	}else if ((Lux1<Lux2) && (Lux1 > 0)){
		return Lux2;
	}else{
		return 0;
	}
}

void TSL2772::readALS_data(){
	uint8_t data[4];
	readRegister(TSL2722_C0DATA_REG | TSL27721_CMD_NORMAL, data, 4);

	_C0DATA = data[1] << 8 | data[0];
	_C1DATA = data[3] << 8 | data[2];

//	readRegister(TSL2722_C0DATA_REG, (uint8_t*) &_C0DATA, 2);
//	readRegister(TSL2722_C1DATA_REG, (uint8_t*) &_C1DATA, 2);
}



/**
 * @brief Write a byte to the given register
 *
 * @param addr Register address
 * @param val The value to set the register to
 */
bool TSL2772::writeRegister(uint8_t mem_addr, uint8_t *val,
		uint16_t size) {
	if (HAL_OK
			== HAL_I2C_Mem_Write(i2c_han, i2c_addr, mem_addr, 1, val, size, 10)) {
		return true;
	} else {
		return false;
	}
}

bool TSL2772::writeRegisterByte(uint8_t mem_addr, uint8_t val) {
	uint8_t data[2];

	data[0] = mem_addr | CMD_REG_W;
	data[1] = val;

	if (HAL_OK
			== HAL_I2C_Master_Transmit(i2c_han, i2c_addr, data, 2, 10)) {
		return true;
	} else {
		return false;
	}

//	if (HAL_OK
//			== HAL_I2C_Mem_Write(i2c_han, i2c_addr, mem_addr, 1, &val, 1, 10)) {
//		return true;
//	} else {
//		return false;
//	}
}

uint8_t TSL2772::modifyBitInByte(uint8_t var, uint8_t value,
		uint8_t pos) {
	uint8_t mask = 1 << pos;
	return ((var & ~mask) | (value << pos));
}

bool TSL2772::readRegister(uint16_t mem_addr, uint8_t *dest,
		uint16_t size) {
	if (HAL_OK
			== HAL_I2C_Mem_Read(i2c_han, i2c_addr, mem_addr, 1, dest, size, 10)) {
		return true;
	} else {
		return false;
	}
}

uint8_t TSL2772::checkRegisterBit(uint16_t reg, uint8_t pos) {
	return (uint8_t) ((readRegisterByte(reg) >> pos) & 0x01);
}

bool TSL2772::modifyRegisterBit(uint16_t reg, bool value, uint8_t pos) {
	uint8_t register_value = readRegisterByte(reg);
	register_value = modifyBitInByte(register_value, (uint8_t) value, pos);

	return writeRegisterByte(reg, register_value);
}

bool TSL2772::modifyRegisterMultipleBit(uint16_t reg, uint8_t value,
		uint8_t pos, uint8_t bits) {
	uint8_t register_value = readRegisterByte(reg);

	uint8_t mask = (1 << (bits)) - 1;
	value &= mask;

	mask <<= pos;
	register_value &= ~mask;          // remove the current data at that spot
	register_value |= value << pos; // and add in the new data

	return writeRegisterByte(reg, register_value);
}

uint8_t TSL2772::readRegisterByte(uint16_t mem_addr) {
	uint8_t data = 0;

	if(HAL_OK != HAL_I2C_Mem_Read(i2c_han, i2c_addr, mem_addr, 1, &data, 1, 10)){
		return 0;
	}
	return data;
}

bool TSL2772::readRegisterBytes(uint16_t mem_addr, uint8_t *data, uint16_t num_bytes) {
	if(HAL_OK != HAL_I2C_Mem_Read(i2c_han, i2c_addr, mem_addr, 1, data, num_bytes, 10)){
		return false;
	}
	return true;
}
