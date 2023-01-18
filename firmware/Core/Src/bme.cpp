/*
 * ppg.c
 *
 *  Created on: Nov 30, 2021
 *      Author: patrick
 */
#include "bme.h"
#include "Adafruit_BME680.h"
#include "packet.h"
#include "main.h"
#include "cmsis_os2.h"
#include "portmacro.h"
#include "captivate_config.h"
//#include "bsec2.h"
//#include "../Middlewares/bsec_2_2_0_0/algo/normal_version/inc/bsec_datatypes.h"
#include "bsec_datatypes.h"
#include "FreeRTOS.h"
#include "task.h"
#include "math.h"
#include "fram.h"

//#include "config/FieldAir_HandSanitizer/FieldAir_HandSanitizer.h"
//#include "config/Default_H2S_NonH2S/Default_H2S_NonH2S.h"
#include "config/bsec_sel_iaq_33v_3s_28d/bsec_serialized_configurations_selectivity.h"


#define BME_SAMPLE_PERIOD_MS		3000
#define MAX_BME_SAMPLES_PACKET	(int)(512-sizeof(PacketHeader))/sizeof(bsecData)
#define BME_WAIT_TOL			10
#define BME_SAVE_STATE_PERIOD_MS	7200000 // every 2 hours

//#define MAX_BME_SAMPLES_PACKET	1
//typedef struct bme_packets {
//	float temperature;
//	uint32_t pressure;
//	float humidity;
//	uint32_t gas_resistance;
//	float altitude;
//} bme_packet;

//typedef struct bme_packets {
//	bsecData output[BSEC_NUMBER_OUTPUTS];
////	uint8_t nOutputs;
//} bme_packet;

static void triggerBMESample(void *argument);

//static bme_packet bmeData[MAX_BME_SAMPLES_PACKET];
static bsecData bmeData[MAX_BME_SAMPLES_PACKET];


static PacketHeader header;
//osThreadId_t bmeTaskHandle;
osTimerId_t periodicBMETimer_id;

Adafruit_BME680 bme;

uint8_t bmeConfig[BSEC_MAX_PROPERTY_BLOB_SIZE];
uint8_t bmeState[BSEC_MAX_STATE_BLOB_SIZE];


void BME_Task(void *argument) {
	SensorPacket *packet = NULL;
	uint32_t flags = 0;


	uint32_t timeSinceLastStateSave = 0;

	osDelay(500);

	osSemaphoreAcquire(messageI2C1_LockHandle, osWaitForever);
	while (!bme.begin(BME68X_DEFAULT_ADDRESS, &hi2c1, false)) {

		osDelay(100);
		osSemaphoreAcquire(messageI2C1_LockHandle, osWaitForever);
	}


	recoverBME_StateConfig();

	osSemaphoreRelease(messageI2C1_LockHandle);

	bme.bsecSubscribe();


//	bme.setTemperatureOversampling(BME680_OS_8X);
//	bme.setHumidityOversampling(BME680_OS_2X);
//	bme.setPressureOversampling(BME680_OS_4X);
//	bme.setIIRFilterSize(BME680_FILTER_SIZE_3);
//	bme.setGasHeater(320, 150); // 320*C for 150 ms

	header.reserved[0] = BME_SAMPLE_PERIOD_MS;

	uint16_t bmeIdx = 0;
	uint32_t bmeID = 0;

	int64_t timeRemaining;

//	periodicBMETimer_id = osTimerNew(triggerBMESample, osTimerPeriodic, NULL,
//			NULL);
//	osTimerStart(periodicBMETimer_id, BME_SAMPLE_PERIOD_MS);

	while (1) {
//		flags = osThreadFlagsWait(GRAB_SAMPLE_BIT | TERMINATE_THREAD_BIT,
//		osFlagsWaitAny, 0);

//		if ((flags & GRAB_SAMPLE_BIT) == GRAB_SAMPLE_BIT) {
		if(1){
//			while (!bme.performReading()) {
//				osDelay(10);
//			}

			/* delay time required for BSEC library */
//			timeRemaining = floor((bme.bmeConf.next_call/1000000.0) - HAL_GetTick());
//			if(timeRemaining > BME_WAIT_TOL){
//				osDelay( (timeRemaining - BME_WAIT_TOL) );
//			}

			osSemaphoreAcquire(messageI2C1_LockHandle, osWaitForever);
//			taskENTER_CRITICAL();
			while(!bme.bsecRun()){
//				taskEXIT_CRITICAL();

				timeRemaining = floor((bme.bmeConf.next_call/1000000.0) - HAL_GetTick());
				if(timeRemaining > BME_WAIT_TOL){
					osSemaphoreRelease(messageI2C1_LockHandle);
					osDelay( (timeRemaining-BME_WAIT_TOL) );
					osSemaphoreAcquire(messageI2C1_LockHandle, osWaitForever);
				}else if(timeRemaining > 1){
					osDelay(1);
				}

//				taskENTER_CRITICAL();
			}
			osSemaphoreRelease(messageI2C1_LockHandle);
//			taskEXIT_CRITICAL();

			for(int i = 0; i<bme.outputs.nOutputs; i++){
				memcpy(&bmeData[bmeIdx++], &bme.outputs.output[i], sizeof(bsecData));
			}

//			memcpy(&bmeData[bmeIdx], &bme.outputs, sizeof(bme.outputs));


//			bmeData[bmeIdx].temperature = bme.temperature;
//			bmeData[bmeIdx].pressure = bme.pressure / 100.0;
//			bmeData[bmeIdx].humidity = bme.humidity;
//			bmeData[bmeIdx].gas_resistance = bme.gas_resistance / 1000.0;
//			bmeData[bmeIdx].altitude = bme.readAltitude(SEALEVELPRESSURE_HPA);
//
//			bmeIdx++;
//			if (bmeIdx >= (MAX_BME_SAMPLES_PACKET - BSEC_NUMBER_OUTPUTS) ) {
			if (1) {

				header.packetType = BME;
				header.packetID = bmeID;
				header.msFromStart = HAL_GetTick();
				header.payloadLength = bmeIdx * sizeof(bsecData);
				packet = grabPacket();
				if (packet != NULL) {
					memcpy(&(packet->header), &header, sizeof(PacketHeader));
					memcpy(packet->payload, bmeData, header.payloadLength);
					queueUpPacket(packet);
				}
				bmeID++;
				bmeIdx = 0;

			}

			if( (HAL_GetTick() - timeSinceLastStateSave) >= BME_SAVE_STATE_PERIOD_MS){
				saveBME_StateConfig();
				timeSinceLastStateSave = HAL_GetTick();
			}

		}

		if ((flags & TERMINATE_THREAD_BIT) == TERMINATE_THREAD_BIT) {
			osTimerDelete (periodicBMETimer_id);
			saveBME_StateConfig();
			bme.soft_reset();

			vTaskDelete( NULL );
			break;
		}
	}
}

void saveBME_StateConfig(){
	uint32_t bsecReturnLen;

	bme.bsecGetConfig(bmeConfig, &bsecReturnLen);
	bme.bsecGetState(bmeState, &bsecReturnLen);

	taskENTER_CRITICAL();
	extMemWriteData(BME_CONFIG_ADDR, bmeConfig, BME_CONFIG_SIZE);
	taskEXIT_CRITICAL();
	taskENTER_CRITICAL();
	extMemWriteData(BME_STATE_ADDR, bmeState, BME_STATE_SIZE);
	taskEXIT_CRITICAL();
}

void recoverBME_StateConfig(){
	uint8_t conditionedSystem = 0;
	extMemGetData(BME_FIRST_RUN_ADDR, &conditionedSystem, BME_FIRST_RUN_SIZE);

	if(conditionedSystem == 0){
		bme.bsecSetConfig(bsec_config_selectivity);
		saveBME_StateConfig();
		conditionedSystem = 1;
		extMemWriteData(BME_FIRST_RUN_ADDR, &conditionedSystem, BME_FIRST_RUN_SIZE);
	}else{
		extMemGetData(BME_CONFIG_ADDR, bmeConfig, BME_CONFIG_SIZE);
		extMemGetData(BME_STATE_ADDR, bmeState, BME_STATE_SIZE);

		bme.bsecSetConfig(bmeConfig);
		bme.bsecSetState(bmeState);
	}

}

static void triggerBMESample(void *argument) {
	osThreadFlagsSet(bmeTaskHandle, GRAB_SAMPLE_BIT);
}