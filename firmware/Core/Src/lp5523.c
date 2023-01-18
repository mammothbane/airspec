/**
 ******************************************************************************
 * File Name           : template.c
 * Description        : Header for Lights.
 ******************************************************************************

 *
 ******************************************************************************
 */
#ifdef __cplusplus
extern "C" {
#endif

/* includes -----------------------------------------------------------*/
#include "lp5523.h"
//#include "stm32wbxx_hal_i2c.h"
#include "stm32wbxx_hal.h"
//#include "i2c.h"
#include "stdint.h"
#include "FreeRTOS.h"
#include "cmsis_os.h"
#include "main.h"
#include "string.h"
#include "captivate_config.h"
//#include "config.h"
//#include "master_thread.h"

//#include "system_settings.h"
//
#include "captivate_config.h"

/* typedef -----------------------------------------------------------*/

/* defines -----------------------------------------------------------*/
#define I2C_HANDLE_TYPEDEF 	&hi2c1
#define I2C_TIMEOUT			10
#define NOMINAL_BLUE_VAL	50
/* macros ------------------------------------------------------------*/

/* function prototypes -----------------------------------------------*/

/* variables -----------------------------------------------*/
#ifdef DONGLE_CODE
GPIO_TypeDef* GPIO_PORT_DONGLE[3] = {LED1_GPIO_Port, LED2_GPIO_Port, LED3_GPIO_Port};
const uint16_t GPIO_PIN_DONGLE[3] = {LED1_Pin, LED2_Pin, LED3_Pin};
#endif
union ColorComplex receivedColor;
osTimerId_t resetTimer;
/* Functions Definition ------------------------------------------------------*/

/*************************************************************
 *
 * LOCAL FUNCTIONS
 *
 *************************************************************/

#define MAX_BRIGHTNESS 255 //up to 255

uint8_t led_left_PWM[9] = { 0 };
uint8_t led_right_PWM[9] = { 0 };
uint8_t led_current[9] = { MAX_BRIGHTNESS, MAX_BRIGHTNESS, MAX_BRIGHTNESS,
		MAX_BRIGHTNESS, MAX_BRIGHTNESS, MAX_BRIGHTNESS, MAX_BRIGHTNESS,
		MAX_BRIGHTNESS, MAX_BRIGHTNESS };
static const union ColorComplex EmptyColorComplex;


//uint8_t led_current[9] = {LED_BRIGHTNESS, 200, 200, 200, 200, 200, 200, 200, 200};

struct LightConfig {
	uint8_t current[9];
	uint8_t intensity[9];
};

const uint8_t packet_array[9] = { LOG_EN, LOG_EN, LOG_EN, LOG_EN, LOG_EN,
		LOG_EN, LOG_EN, LOG_EN, LOG_EN };
uint8_t deviceAddress;
uint8_t led_PWM[9] = { 0 };
uint8_t packet;

void setup_LP5523(uint8_t ADDR) {

#ifndef DONGLE_CODE
	deviceAddress = ADDR << 1;

	// enable chip
	osSemaphoreAcquire(messageI2C1_LockHandle, osWaitForever);
	packet = LP5525_CHIP_EN;
//	while(HAL_I2C_Mem_Write(I2C_HANDLE_TYPEDEF, deviceAddress, LIS3DH_EN_CNTRL1_REG, 1, &packet, 1, I2C_TIMEOUT) != HAL_OK);
	HAL_I2C_Mem_Write(I2C_HANDLE_TYPEDEF, deviceAddress, LIS3DH_EN_CNTRL1_REG,
			1, &packet, 1, I2C_TIMEOUT);

	// put charge-pump in auto-mode, serial auto increment, internal clock
	packet = CP_MODE_AUTO | EN_AUTO_INC | INT_CLK_EN;
//	while(HAL_I2C_Mem_Write(I2C_HANDLE_TYPEDEF, deviceAddress, LIS3DH_MISC_REG, 1, &packet, 1, I2C_TIMEOUT) != HAL_OK);
	HAL_I2C_Mem_Write(I2C_HANDLE_TYPEDEF, deviceAddress, LIS3DH_MISC_REG, 1,
			&packet, 1, I2C_TIMEOUT);

	// set PWM level (0 to 255)
//	while(HAL_I2C_Mem_Write(I2C_HANDLE_TYPEDEF, deviceAddress, LIS3DH_D1_PWM_REG, 1, led_PWM, 9, I2C_TIMEOUT) != HAL_OK);
	HAL_I2C_Mem_Write(I2C_HANDLE_TYPEDEF, deviceAddress, LIS3DH_D1_PWM_REG, 1,
			led_PWM, 9, I2C_TIMEOUT);

	// set current control (0 to 25.5 mA) - step size is 100uA
//	while(HAL_I2C_Mem_Write(I2C_HANDLE_TYPEDEF, deviceAddress, LIS3DH_D1_CURRENT_CTRL_REG, 1, led_current, 9, I2C_TIMEOUT) != HAL_OK);
	HAL_I2C_Mem_Write(I2C_HANDLE_TYPEDEF, deviceAddress,
			LIS3DH_D1_CURRENT_CTRL_REG, 1, led_current, 9, I2C_TIMEOUT);

	// enable logarithmic dimming
//	packet = LOG_EN;
//	while(HAL_I2C_Mem_Write(I2C_HANDLE_TYPEDEF, deviceAddress, LIS3DH_D1_CNTRL_REG, 1, packet_array, 9, I2C_TIMEOUT) != HAL_OK);
	HAL_I2C_Mem_Write(I2C_HANDLE_TYPEDEF, deviceAddress, LIS3DH_D1_CNTRL_REG, 1,
			packet_array, 9, I2C_TIMEOUT);

	osSemaphoreRelease(messageI2C1_LockHandle);
#else
	BSP_LED_Init(LED_BLUE);
	BSP_LED_Init(LED_GREEN);
	BSP_LED_Init(LED_RED);
#endif
}
//LP5523::LP5523(uint16_t DevAddress){
//	deviceAddress = DevAddress;
//}
///*!
// *  @brief  Setups the HW (reads coefficients values, etc.)
// *  @param  i2caddr
// *          i2c address (optional, fallback to default)
// *  @param  nWAI
// *          Who Am I register value - defaults to 0x33 (LIS3DH)
// *  @return true if successful
// */
//bool LP5523::begin(void) {
//
//	uint8_t packet;
//
//	// enable chip
//	packet = LP5525_CHIP_EN;
//	HAL_I2C_Mem_Write(I2C_HANDLE_TYPEDEF, deviceAddress, LIS3DH_EN_CNTRL1_REG, 1, &packet, 1, I2C_TIMEOUT);
//
//	// set PWM level (0 to 255)
//	packet = 100;
//	HAL_I2C_Mem_Write(I2C_HANDLE_TYPEDEF, deviceAddress, LIS3DH_D1_PWM_REG, 1, &packet, 1, I2C_TIMEOUT);
//
//	// set current control (0 to 25.5 mA) - step size is 100uA
//	packet = 255 * (5/25.5);
//	HAL_I2C_Mem_Write(I2C_HANDLE_TYPEDEF, deviceAddress, LIS3DH_D1_CURRENT_CTRL_REG, 1, &packet, 1, I2C_TIMEOUT);
//
//	// put charge-pump in auto-mode, serial auto increment, internal clock
//	packet = CP_MODE_AUTO | EN_AUTO_INC | INT_CLK_EN;
//	HAL_I2C_Mem_Write(I2C_HANDLE_TYPEDEF, deviceAddress, LIS3DH_MISC_REG, 1, &packet, 1, I2C_TIMEOUT);
//
//
//  return true;
//}

void FrontLightsSet(union ColorComplex *setColors) {

	memcpy(led_left_PWM, setColors, 9);
	memcpy(led_right_PWM, &(setColors->color[9]), 9);
#ifndef DONGLE_CODE
	osSemaphoreAcquire(messageI2C1_LockHandle, osWaitForever);
	HAL_I2C_Mem_Write(I2C_HANDLE_TYPEDEF, LIS3DH_LEFT_ADDRESS << 1,
			LIS3DH_D1_PWM_REG, 1, led_left_PWM, 9, I2C_TIMEOUT);
	HAL_I2C_Mem_Write(I2C_HANDLE_TYPEDEF, LIS3DH_RIGHT_ADDRESS << 1,
			LIS3DH_D1_PWM_REG, 1, led_right_PWM, 9, I2C_TIMEOUT);
	osSemaphoreRelease(messageI2C1_LockHandle);
#endif

#ifdef DONGLE_CODE
	    	if(led_left_PWM[LED_LEFT_TOP_R] > 0)
	    	{
				HAL_GPIO_WritePin(LED3_GPIO_Port, LED3_Pin, GPIO_PIN_SET);

	    	}
	    	else
			{
				HAL_GPIO_WritePin(LED3_GPIO_Port, LED3_Pin, GPIO_PIN_RESET);
			}

	    	// if 1
	    	if (led_left_PWM[LED_LEFT_TOP_B] > 0)
	    	{
	    		HAL_GPIO_WritePin(LED1_GPIO_Port, LED1_Pin, GPIO_PIN_SET);
			}
	    	else
			{
				HAL_GPIO_WritePin(LED1_GPIO_Port, LED1_Pin, GPIO_PIN_RESET);
			}

	    	//if 2
	    	if (led_left_PWM[LED_LEFT_TOP_G] > 0)
	    	{
				HAL_GPIO_WritePin(LED2_GPIO_Port, LED2_Pin, GPIO_PIN_SET);
			}
	    	else
	    	{
	    		HAL_GPIO_WritePin(LED3_GPIO_Port, LED3_Pin, GPIO_PIN_RESET);
	    	}
#endif
}

union ColorComplex receivedColors;
void ThreadFrontLightsComplexTask(void *argument){

	osDelay(500);

	setup_LP5523(LIS3DH_LEFT_ADDRESS);
	setup_LP5523(LIS3DH_RIGHT_ADDRESS);

	resetTimer = osTimerNew(resetLED, osTimerOnce, NULL, NULL);


	HAL_StatusTypeDef state = 0;

	uint16_t timeTracker;


	while (1) {
		osMessageQueueGet(lightsComplexQueueHandle, &receivedColors,
						0U, osWaitForever);
		memcpy(led_left_PWM, &receivedColors, 9);
		memcpy(led_right_PWM, &(receivedColors.color[9]), 9);
	#ifndef DONGLE_CODE
		osSemaphoreAcquire(messageI2C1_LockHandle, osWaitForever);

//		timeTracker = HAL_GetTick();
//		HAL_I2C_Mem_Write_DMA(I2C_HANDLE_TYPEDEF, LIS3DH_LEFT_ADDRESS << 1,
//				LIS3DH_D1_PWM_REG, 1, led_left_PWM, 9);
		state = HAL_I2C_Mem_Write(I2C_HANDLE_TYPEDEF, LIS3DH_LEFT_ADDRESS << 1,
				LIS3DH_D1_PWM_REG, 1, led_left_PWM, 9, 5);


//		counter = 0;
//		while( (HAL_I2C_GetState(I2C_HANDLE_TYPEDEF) != HAL_I2C_STATE_READY)){
//			counter+=20;
//			osDelay(20);
//			if(counter > 1000){
//				HAL_I2C_Master_Abort_IT(I2C_HANDLE_TYPEDEF, LIS3DH_LEFT_ADDRESS << 1);
//				break;
//			}
////			if(counter > 1000){
////				HAL_I2C_Master_Abort_IT(I2C_HANDLE_TYPEDEF, LIS3DH_LEFT_ADDRESS << 1);
////			}
//		}

		state = HAL_I2C_Mem_Write(I2C_HANDLE_TYPEDEF, LIS3DH_RIGHT_ADDRESS << 1,
				LIS3DH_D1_PWM_REG, 1, led_right_PWM, 9, 5);

//		timeTracker = HAL_GetTick() - timeTracker;

//		HAL_I2C_Mem_Write_DMA(I2C_HANDLE_TYPEDEF, LIS3DH_RIGHT_ADDRESS << 1,
//				LIS3DH_D1_PWM_REG, 1, led_right_PWM, 9);

//		counter = 0;
//		while( (HAL_I2C_GetState(I2C_HANDLE_TYPEDEF) != HAL_I2C_STATE_READY)){
//			counter+=20;
//			osDelay(20);
//
//			if(counter > 1000){
//				HAL_I2C_Master_Abort_IT(I2C_HANDLE_TYPEDEF, LIS3DH_LEFT_ADDRESS << 1);
//			}
//		}

		osSemaphoreRelease(messageI2C1_LockHandle);
	#endif
	}
}


struct test_color {
	uint8_t left_front_b;
	uint8_t left_front_g;
	uint8_t left_top_b;
	uint8_t left_top_g;
	uint8_t left_side_b;
	uint8_t left_side_g;
	uint8_t left_front_r;
	uint8_t left_top_r;
	uint8_t left_side_r;

	uint8_t right_front_b;
	uint8_t right_front_g;
	uint8_t right_top_b;
	uint8_t right_top_g;
	uint8_t right_side_b;
	uint8_t right_side_g;
	uint8_t right_front_r;
	uint8_t right_top_r;
	uint8_t right_side_r;
};

struct test_color tempComplexLight;

void ThreadFrontLightsTask(void *argument) {

//	osDelay(1); // added delay because it seems that semaphores arent fully initialized and code stalls when releasing semaphore
//#ifndef DONGLE_CODE
	setup_LP5523(LIS3DH_LEFT_ADDRESS);
	setup_LP5523(LIS3DH_RIGHT_ADDRESS);
//#endif

	uint32_t lightsSimpleMessageReceived;


	ledDisconnectNotification();

#ifdef LED_TEST
	uint8_t led_test = 1;
#endif

	while (1) {

		lightsSimpleMessageReceived = 0;

#ifdef LED_TEST
		if (led_test == 1){
			while(1){
				tempComplexLight.left_front_r = 0;
				tempComplexLight.left_side_r = 0;
				tempComplexLight.left_top_r = 0;
				tempComplexLight.left_front_g = 0;
				tempComplexLight.left_side_g = 0;
				tempComplexLight.left_top_g = 0;
				tempComplexLight.left_front_b = 0;
				tempComplexLight.left_side_b = 255;
				tempComplexLight.left_top_b = 0;


				tempComplexLight.right_front_g = 0;
				tempComplexLight.right_side_g = 0;
				tempComplexLight.right_top_g = 0;
				tempComplexLight.right_front_b = 0;
				tempComplexLight.right_side_b = 255;
				tempComplexLight.right_top_b = 0;
				tempComplexLight.right_front_r = 0;
				tempComplexLight.right_side_r = 0;
				tempComplexLight.right_top_r = 0;

				FrontLightsSet(&tempComplexLight);

				osDelay(5000);


//				tempComplexLight.left_front_r = 0;
//				tempComplexLight.left_side_r = 0;
//				tempComplexLight.left_top_r = 0;
//				tempComplexLight.left_front_g = 255;
//				tempComplexLight.left_side_g = 255;
//				tempComplexLight.left_top_g = 255;
//				tempComplexLight.left_front_b = 0;
//				tempComplexLight.left_side_b = 0;
//				tempComplexLight.left_top_b = 0;
//
//
//				tempComplexLight.right_front_g = 255;
//				tempComplexLight.right_side_g = 255;
//				tempComplexLight.right_top_g = 255;
//				tempComplexLight.right_front_b = 0;
//				tempComplexLight.right_side_b = 0;
//				tempComplexLight.right_top_b = 0;
//				tempComplexLight.right_front_r = 0;
//				tempComplexLight.right_side_r = 0;
//				tempComplexLight.right_top_r = 0;
//
//				FrontLightsSet(&tempComplexLight);
//
//				osDelay(5000);
//
//				tempComplexLight.left_front_r = 0;
//				tempComplexLight.left_side_r = 0;
//				tempComplexLight.left_top_r = 0;
//				tempComplexLight.left_front_g = 0;
//				tempComplexLight.left_side_g = 0;
//				tempComplexLight.left_top_g = 0;
//				tempComplexLight.left_front_b = 255;
//				tempComplexLight.left_side_b = 255;
//				tempComplexLight.left_top_b = 255;
//
//
//				tempComplexLight.right_front_g = 0;
//				tempComplexLight.right_side_g = 0;
//				tempComplexLight.right_top_g = 0;
//				tempComplexLight.right_front_b = 255;
//				tempComplexLight.right_side_b = 255;
//				tempComplexLight.right_top_b = 255;
//				tempComplexLight.right_front_r = 0;
//				tempComplexLight.right_side_r = 0;
//				tempComplexLight.right_top_r = 0;
//
//				FrontLightsSet(&tempComplexLight);
//
//				osDelay(5000);
//
//				tempComplexLight.left_front_r = 255;
//				tempComplexLight.left_side_r = 255;
//				tempComplexLight.left_top_r = 255;
//				tempComplexLight.left_front_g = 0;
//				tempComplexLight.left_side_g = 0;
//				tempComplexLight.left_top_g = 0;
//				tempComplexLight.left_front_b = 0;
//				tempComplexLight.left_side_b = 0;
//				tempComplexLight.left_top_b = 0;
//
//
//				tempComplexLight.right_front_g = 0;
//				tempComplexLight.right_side_g = 0;
//				tempComplexLight.right_top_g = 0;
//				tempComplexLight.right_front_b = 0;
//				tempComplexLight.right_side_b = 0;
//				tempComplexLight.right_top_b = 0;
//				tempComplexLight.right_front_r = 255;
//				tempComplexLight.right_side_r = 255;
//				tempComplexLight.right_top_r = 255;
//
//				FrontLightsSet(&tempComplexLight);
//
//				osDelay(5000);
			}


			led_test = 0;

		}
#endif

		osDelay(1);

		osMessageQueueGet(lightsSimpleQueueHandle, &lightsSimpleMessageReceived,
				0U, osWaitForever);

		for (int i = 0; i <= 8; i++) {
			led_left_PWM[i] = (lightsSimpleMessageReceived & 0x01) * 255;
			lightsSimpleMessageReceived = lightsSimpleMessageReceived >> 1;
		}

		for (int i = 0; i <= 8; i++) {
			led_right_PWM[i] = (lightsSimpleMessageReceived & 0x01) * 255;
			lightsSimpleMessageReceived = lightsSimpleMessageReceived >> 1;
		}

		osSemaphoreAcquire(messageI2C1_LockHandle, osWaitForever);
		HAL_I2C_Mem_Write(I2C_HANDLE_TYPEDEF, LIS3DH_LEFT_ADDRESS << 1,
				LIS3DH_D1_PWM_REG, 1, led_left_PWM, 9, I2C_TIMEOUT);
		HAL_I2C_Mem_Write(I2C_HANDLE_TYPEDEF, LIS3DH_RIGHT_ADDRESS << 1,
				LIS3DH_D1_PWM_REG, 1, led_right_PWM, 9, I2C_TIMEOUT);
		osSemaphoreRelease(messageI2C1_LockHandle);

	}
}

#ifdef DONGLE_CODE
/**
  * @brief  Configures LED GPIO.
  * @param  Led: LED to be configured.
  *          This parameter can be one of the following values:
  *     @arg LED2
  * @retval None
  */
void BSP_LED_Init(Led_TypeDef Led)
{
  GPIO_InitTypeDef  gpioinitstruct = {0};

  /* Enable the GPIO_LED Clock */
  LEDx_GPIO_CLK_ENABLE(Led);

  /* Configure the GPIO_LED pin */
  gpioinitstruct.Pin = GPIO_PIN_DONGLE[Led];
  gpioinitstruct.Mode = GPIO_MODE_OUTPUT_PP;
  gpioinitstruct.Pull = GPIO_NOPULL;
  gpioinitstruct.Speed = GPIO_SPEED_FREQ_HIGH;

  HAL_GPIO_Init(GPIO_PORT_DONGLE[Led], &gpioinitstruct);

  HAL_GPIO_WritePin(GPIO_PORT_DONGLE[Led], GPIO_PIN_DONGLE[Led], GPIO_PIN_RESET);
}

/**
  * @brief  DeInit LEDs.
  * @param  Led: LED to be de-init.
  *   This parameter can be one of the following values:
  *     @arg  LED2
  * @note Led DeInit does not disable the GPIO clock nor disable the Mfx
  * @retval None
  */
void BSP_LED_DeInit(Led_TypeDef Led)
{
  GPIO_InitTypeDef  gpio_init_structure;

  /* Turn off LED */
  HAL_GPIO_WritePin(GPIO_PORT_DONGLE[Led], GPIO_PIN_DONGLE[Led], GPIO_PIN_RESET);
  /* DeInit the GPIO_LED pin */
  gpio_init_structure.Pin = GPIO_PIN_DONGLE[Led];
  HAL_GPIO_DeInit(GPIO_PORT_DONGLE[Led], gpio_init_structure.Pin);
}

/**
  * @brief  Turns selected LED On.
  * @param  Led: Specifies the Led to be set on.
  *   This parameter can be one of following parameters:
  *     @arg LED2
  * @retval None
  */
void BSP_LED_On(Led_TypeDef Led)
{
  HAL_GPIO_WritePin(GPIO_PORT_DONGLE[Led], GPIO_PIN_DONGLE[Led], GPIO_PIN_SET);
}

/**
  * @brief  Turns selected LED Off.
  * @param  Led: Specifies the Led to be set off.
  *   This parameter can be one of following parameters:
  *     @arg LED2
  * @retval None
  */
void BSP_LED_Off(Led_TypeDef Led)
{
  HAL_GPIO_WritePin(GPIO_PORT_DONGLE[Led], GPIO_PIN_DONGLE[Led], GPIO_PIN_RESET);
}

/**
  * @brief  Toggles the selected LED.
  * @param  Led: Specifies the Led to be toggled.
  *   This parameter can be one of following parameters:
  *     @arg LED2
  * @retval None
  */
void BSP_LED_Toggle(Led_TypeDef Led)
{
  HAL_GPIO_TogglePin(GPIO_PORT_DONGLE[Led], GPIO_PIN_DONGLE[Led]);
}
#endif

//void ledStartupSequence(void){
//	resetColor(&receivedColor);
//
//	receivedColor.colors_indiv.left_front_b = 255;
//	osMessageQueuePut(lightsComplexQueueHandle, &receivedColor, 0, 0);
////	FrontLightsSet(&receivedColor););
//	osDelay(LED_START_SEQ_INTERVAL);
//
//	receivedColor.colors_indiv.left_front_b = 0;
//	receivedColor.colors_indiv.left_front_g = 255;
//
//	receivedColor.colors_indiv.left_top_b = 255;
//	osMessageQueuePut(lightsComplexQueueHandle, &receivedColor, 0, 0);
////	FrontLightsSet(&receivedColor);
//	osDelay(LED_START_SEQ_INTERVAL);
//
//	receivedColor.colors_indiv.left_front_g = 0;
//	receivedColor.colors_indiv.left_front_r = 255;
//
//	receivedColor.colors_indiv.left_top_b = 0;
//	receivedColor.colors_indiv.left_top_g = 255;
//
//	receivedColor.colors_indiv.left_side_b = 255;
//	osMessageQueuePut(lightsComplexQueueHandle, &receivedColor, 0, 0);
////	FrontLightsSet(&receivedColor);
//	osDelay(LED_START_SEQ_INTERVAL);
//
//	receivedColor.colors_indiv.left_front_r = 0;
//
//	receivedColor.colors_indiv.left_top_g = 0;
//	receivedColor.colors_indiv.left_top_r = 255;
//
//	receivedColor.colors_indiv.left_side_b = 0;
//	receivedColor.colors_indiv.left_side_g = 255;
//
//	receivedColor.colors_indiv.right_side_b = 255;
//	osMessageQueuePut(lightsComplexQueueHandle, &receivedColor, 0, 0);
////	FrontLightsSet(&receivedColor);
//	osDelay(LED_START_SEQ_INTERVAL);
//
//	receivedColor.colors_indiv.left_top_r = 0;
//
//	receivedColor.colors_indiv.left_side_g = 0;
//	receivedColor.colors_indiv.left_side_r = 255;
//
//	receivedColor.colors_indiv.right_side_b = 0;
//	receivedColor.colors_indiv.right_side_g = 255;
//
//	receivedColor.colors_indiv.right_top_b = 255;
//	osMessageQueuePut(lightsComplexQueueHandle, &receivedColor, 0, 0);
////	FrontLightsSet(&receivedColor);
//	osDelay(LED_START_SEQ_INTERVAL);
//
//	receivedColor.colors_indiv.left_side_r = 0;
//
//	receivedColor.colors_indiv.right_side_g = 0;
//	receivedColor.colors_indiv.right_side_r = 255;
//
//	receivedColor.colors_indiv.right_top_b = 0;
//	receivedColor.colors_indiv.right_top_g = 255;
//
//	receivedColor.colors_indiv.right_front_b = 255;
//	osMessageQueuePut(lightsComplexQueueHandle, &receivedColor, 0, 0);
////	FrontLightsSet(&receivedColor);
//	osDelay(LED_START_SEQ_INTERVAL);
//
//	receivedColor.colors_indiv.right_side_r = 0;
//
//	receivedColor.colors_indiv.right_top_g = 0;
//	receivedColor.colors_indiv.right_top_r = 255;
//
//	receivedColor.colors_indiv.right_front_b = 0;
//	receivedColor.colors_indiv.right_front_g = 255;
//	osMessageQueuePut(lightsComplexQueueHandle, &receivedColor, 0, 0);
////	FrontLightsSet(&receivedColor);
//	osDelay(LED_START_SEQ_INTERVAL);
//
//	receivedColor.colors_indiv.right_top_r = 0;
//
//	receivedColor.colors_indiv.right_front_g = 0;
//	receivedColor.colors_indiv.right_front_r = 255;
//	osMessageQueuePut(lightsComplexQueueHandle, &receivedColor, 0, 0);
////	FrontLightsSet(&receivedColor);
//	osDelay(LED_START_SEQ_INTERVAL);
//
//	receivedColor.colors_indiv.right_front_r = 0;
//	osMessageQueuePut(lightsComplexQueueHandle, &receivedColor, 0, 0);
////	FrontLightsSet(&receivedColor);
//
//	ledDisconnectNotification();
//}

void ledStartupSequence(void){
//	resetColor(&receivedColor);
//	while(1){
//
//
//
//	receivedColor.colors_indiv.right_side_r = 255;
//	receivedColor.colors_indiv.left_side_r = 255;
//	osMessageQueuePut(lightsComplexQueueHandle, &receivedColor, 0, 0);
//	osDelay(LED_START_SEQ_INTERVAL);
//
//	receivedColor.colors_indiv.right_side_r = 0;
//	receivedColor.colors_indiv.left_side_r = 0;
//	osMessageQueuePut(lightsComplexQueueHandle, &receivedColor, 0, 0);
//	osDelay(LED_START_SEQ_INTERVAL);
//	}

	resetColor(&receivedColor);
	while(1){

	receivedColor.colors_indiv.right_side_b = 255;
	receivedColor.colors_indiv.left_side_b = 255;
	osMessageQueuePut(lightsComplexQueueHandle, &receivedColor, 0, 0);
	osDelay(LED_START_SEQ_INTERVAL);

//	receivedColor.colors_indiv.right_side_r = 0;
//	receivedColor.colors_indiv.left_side_r = 0;
//	osMessageQueuePut(lightsComplexQueueHandle, &receivedColor, 0, 0);
//	osDelay(LED_START_SEQ_INTERVAL);
	}
}

union ColorComplex blueGreenTranColor;
void BlueGreenTransitionTask(void *argument){
	union BlueGreenTransition blueGreenTran;
	uint32_t timeTracker = 0;

	memcpy(&blueGreenTran,argument,sizeof(union BlueGreenTransition));

	/* start sequence */

	//	timeTracker = HAL_GetTick();

	resetColor(&blueGreenTranColor);


	// error condition: if step size exceeds intensity range
	if( (blueGreenTran.val.step_size >= blueGreenTran.val.blue_max_intensity) ||
			(blueGreenTran.val.step_size >= blueGreenTran.val.green_max_intensity)){
		vTaskDelete( NULL );
	}

	/* increase blue intensity */
	if(blueGreenTran.val.blue_max_intensity > blueGreenTran.val.blue_min_intensity){
		for(int i = blueGreenTran.val.blue_min_intensity;;
				i += blueGreenTran.val.step_size){

			blueGreenTranColor.colors_indiv.right_side_b = (i > blueGreenTran.val.blue_max_intensity) ? blueGreenTran.val.blue_max_intensity : i;
			blueGreenTranColor.colors_indiv.left_side_b = blueGreenTranColor.colors_indiv.right_side_b;
			osMessageQueuePut(lightsComplexQueueHandle, &blueGreenTranColor, 0, 0);
			osDelay(blueGreenTran.val.step_duration);

			if(i >= blueGreenTran.val.blue_max_intensity){
				break;
			}
		}
	}

	/* start transition */
	for(int i = 0;
			i <= 255;
			i += blueGreenTran.val.step_size){
		blueGreenTranColor.colors_indiv.right_side_b = (i > blueGreenTran.val.blue_max_intensity) ? 0 : blueGreenTran.val.blue_max_intensity - i;
		blueGreenTranColor.colors_indiv.left_side_b = blueGreenTranColor.colors_indiv.right_side_b;

		blueGreenTranColor.colors_indiv.right_side_g = (i > blueGreenTran.val.green_max_intensity) ? blueGreenTran.val.green_max_intensity : i;
		blueGreenTranColor.colors_indiv.left_side_g = blueGreenTranColor.colors_indiv.right_side_g;

		osMessageQueuePut(lightsComplexQueueHandle, &blueGreenTranColor, 0, 0);

		if( (blueGreenTran.val.green_max_intensity == blueGreenTranColor.colors_indiv.right_side_g) &&
				(blueGreenTran.val.blue_max_intensity == blueGreenTranColor.colors_indiv.right_side_b)){

		}else{
			osDelay(blueGreenTran.val.step_duration);
		}
	}

//	// compensate for time it takes to set LEDs
//	timeTracker = HAL_GetTick() - timeTracker;
//	if(timeTracker < blueGreenTran->val.step_duration){
//		osDelay(blueGreenTran->val.step_duration - timeTracker);
//	}

	vTaskDelete( NULL );
}

union ColorComplex redFlashColor;
void RedFlashTask(void *argument){
	union RedFlash redFlash;

	uint32_t timeTracker = 0;

	memcpy(&redFlash,argument,sizeof(union RedFlash));

	// since we one delay will be a cycle of turning on and off an LED
	redFlash.val_flash.delay_duration = redFlash.val_flash.delay_duration / 2;

	/* start sequence */

	resetColor(&redFlashColor);

	if(redFlash.val_flash.total_duration > 0){
		uint32_t start_time = HAL_GetTick();
		while( (HAL_GetTick() - start_time) < redFlash.val_flash.total_duration){
				timeTracker = HAL_GetTick();
				if(redFlashColor.colors_indiv.right_side_r == 0){
					redFlashColor.colors_indiv.right_side_r = redFlash.val_flash.intensity;
					redFlashColor.colors_indiv.left_side_r = redFlash.val_flash.intensity;
				}else{
					redFlashColor.colors_indiv.right_side_r = 0;
					redFlashColor.colors_indiv.left_side_r = 0;
				}

				osSemaphoreAcquire(messageI2C1_LockHandle, osWaitForever);
				HAL_I2C_Mem_Write(I2C_HANDLE_TYPEDEF, LIS3DH_LEFT_ADDRESS << 1,
								LIS3DH_D1_PWM_REG, 1, &redFlashColor.color[0], 9, 5);

				HAL_I2C_Mem_Write(I2C_HANDLE_TYPEDEF, LIS3DH_RIGHT_ADDRESS << 1,
						LIS3DH_D1_PWM_REG, 1,  &redFlashColor.color[9], 9, 5);

				osSemaphoreRelease(messageI2C1_LockHandle);


//				osMessageQueuePut(lightsComplexQueueHandle, &redFlashColor, 0, 0);
				timeTracker = HAL_GetTick() - HAL_GetTick();

				if(timeTracker <= redFlash.val_flash.delay_duration){
					osDelay(redFlash.val_flash.delay_duration - timeTracker);
				}
			}
		resetLED();
	}else{
		while(1){
				timeTracker = HAL_GetTick();
				if(redFlashColor.colors_indiv.right_side_r == 0){
					redFlashColor.colors_indiv.right_side_r = redFlash.val_flash.intensity;
					redFlashColor.colors_indiv.left_side_r = redFlash.val_flash.intensity;
				}else{
					redFlashColor.colors_indiv.right_side_r = 0;
					redFlashColor.colors_indiv.left_side_r = 0;
				}

				osSemaphoreAcquire(messageI2C1_LockHandle, osWaitForever);

				HAL_I2C_Mem_Write(I2C_HANDLE_TYPEDEF, LIS3DH_LEFT_ADDRESS << 1,
								LIS3DH_D1_PWM_REG, 1, &redFlashColor.color[0], 9, 5);

				HAL_I2C_Mem_Write(I2C_HANDLE_TYPEDEF, LIS3DH_RIGHT_ADDRESS << 1,
						LIS3DH_D1_PWM_REG, 1,  &redFlashColor.color[9], 9, 5);
				osSemaphoreRelease(messageI2C1_LockHandle);

//				osMessageQueuePut(lightsComplexQueueHandle, &redFlashColor, 0, 0);
				timeTracker = HAL_GetTick() - HAL_GetTick();

				if(timeTracker <= redFlash.val_flash.delay_duration){
					osDelay(redFlash.val_flash.delay_duration - timeTracker);
				}
			}
	}


	vTaskDelete( NULL );
}

void ledEnterDFUNotification(void){
	if(sensorThreadsRunning){
		resetColor(&receivedColor);

		receivedColor.colors_indiv.left_side_g = 120;
		receivedColor.colors_indiv.left_top_g = 120;
		receivedColor.colors_indiv.left_top_r = 120;
		receivedColor.colors_indiv.left_side_r = 120;
//		receivedColor.colors_indiv.left_top_g = 120;
//		receivedColor.colors_indiv.right_top_g = 120;
//		receivedColor.colors_indiv.left_front_g = 120;
//		receivedColor.colors_indiv.right_front_g = 120;

//		osMessageQueuePut(lightsComplexQueueHandle, &receivedColor, 0, 0);

		osSemaphoreAcquire(messageI2C1_LockHandle, osWaitForever);
		HAL_I2C_Mem_Write(I2C_HANDLE_TYPEDEF, LIS3DH_LEFT_ADDRESS << 1,
						LIS3DH_D1_PWM_REG, 1, &receivedColor.color[0], 9, 5);

		HAL_I2C_Mem_Write(I2C_HANDLE_TYPEDEF, LIS3DH_RIGHT_ADDRESS << 1,
				LIS3DH_D1_PWM_REG, 1,  &receivedColor.color[9], 9, 5);
		osSemaphoreRelease(messageI2C1_LockHandle);

	}
}


void ledDisconnectNotification(void){
	if(sensorThreadsRunning){
		resetColor(&receivedColor);

		receivedColor.colors_indiv.left_side_g = 0;
		receivedColor.colors_indiv.right_side_g = 0;
		receivedColor.colors_indiv.left_side_b = NOMINAL_BLUE_VAL;
		receivedColor.colors_indiv.right_side_b = NOMINAL_BLUE_VAL;
		osMessageQueuePut(lightsComplexQueueHandle, &receivedColor, 0, 0);
//		osDelay(10);
	}
//	FrontLightsSet(&receivedColor);
}

void resetLED(void){
	resetColor(&receivedColor);
	osMessageQueuePut(lightsComplexQueueHandle, &receivedColor, 0, 0);
}

//void ledBlueGreenTransition(uint16_t timeInterval){
//
//	uint8_t blueVal = NOMINAL_BLUE_VAL;
//	uint8_t greenVal = 0;
//
//	// slowly increase intensity of blue light
//	while(uint8_t i=NOMINAL_BLUE_VAL; i++; i<=255){
//
//		osDelay(timeInterval);
//	}
//
//
//	// start transition to green
//	while(1){
//		resetColor(&receivedColor);
//
//		receivedColor.colors_indiv.left_side_g = 0;
//		receivedColor.colors_indiv.right_side_g = 0;
//		receivedColor.colors_indiv.left_side_b = 50;
//		receivedColor.colors_indiv.right_side_b = 50;
//		osMessageQueuePut(lightsComplexQueueHandle, &receivedColor, 0, 0);
//		osDelay(10);
//	}
////	FrontLightsSet(&receivedColor);
//}

void ledConnectNotification(void){
	if(sensorThreadsRunning){
		resetColor(&receivedColor);

		receivedColor.colors_indiv.left_side_b = 0;
		receivedColor.colors_indiv.right_side_b = 0;
		receivedColor.colors_indiv.left_side_g = 80;
		receivedColor.colors_indiv.right_side_g = 80;
		osMessageQueuePut(lightsComplexQueueHandle, &receivedColor, 0, 0);
	//	FrontLightsSet(&receivedColor);
//		osDelay(1000);
		receivedColor.colors_indiv.left_side_g = 0;
		receivedColor.colors_indiv.right_side_g = 0;

		osTimerStart(resetTimer, 1000);
//		osTimerDelete(resetTimer);
//		osMessageQueuePut(lightsComplexQueueHandle, &receivedColor, 0, 0);
	//	FrontLightsSet(&receivedColor);
	}
}



void ledAllRed(void){
	if(sensorThreadsRunning){
		resetColor(&receivedColor);

		receivedColor.colors_indiv.left_side_r = 255;
		receivedColor.colors_indiv.right_side_r = 255;
		receivedColor.colors_indiv.left_top_r = 255;
		receivedColor.colors_indiv.right_top_r = 255;
		receivedColor.colors_indiv.left_front_r = 255;
		receivedColor.colors_indiv.right_front_r = 255;
		osMessageQueuePut(lightsComplexQueueHandle, &receivedColor, 0, 0);
	}
}

void resetColor(union ColorComplex * colorComplex){
	memcpy(colorComplex,&EmptyColorComplex,sizeof(union ColorComplex));;
}


#ifdef __cplusplus
}
#endif

/*************************************************************
 *
 * FREERTOS WRAPPER FUNCTIONS
 *
 *************************************************************/