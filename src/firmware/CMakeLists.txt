#THIS FILE IS AUTO GENERATED FROM THE TEMPLATE! DO NOT CHANGE!
set(CMAKE_SYSTEM_NAME Generic)
set(CMAKE_SYSTEM_VERSION 1)
cmake_minimum_required(VERSION 3.22)

# specify cross-compilers and tools
set(CMAKE_C_COMPILER arm-none-eabihf-gcc)
set(CMAKE_CXX_COMPILER arm-none-eabihf-g++)
set(CMAKE_ASM_COMPILER  arm-none-eabihf-gcc)
set(CMAKE_AR arm-none-eabihf-ar)
set(CMAKE_OBJCOPY arm-none-eabihf-objcopy)
set(CMAKE_OBJDUMP arm-none-eabihf-objdump)
set(SIZE arm-none-eabihf-size)
set(CMAKE_TRY_COMPILE_TARGET_TYPE STATIC_LIBRARY)

# project settings
project(captivatesEnv C CXX ASM)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_C_STANDARD 11)

set(CMAKE_MODULE_PATH ${CMAKE_CURRENT_SOURCE_DIR}/Middlewares/nanopb/extra)
find_package(Nanopb REQUIRED)

include_directories(${NANOPB_INCLUDE_DIRS})

nanopb_generate_cpp(PROTO_SRCS PROTO_HDRS
        ../../proto/firmware/sensor.proto
        ../../proto/firmware/sensor/blink.proto
        ../../proto/firmware/sensor/bme.proto
        ../../proto/firmware/sensor/imu.proto
        ../../proto/firmware/sensor/lp5523.proto
        ../../proto/firmware/sensor/lux.proto
        ../../proto/firmware/sensor/mic.proto
        ../../proto/firmware/sensor/sht.proto
        ../../proto/firmware/sensor/spectrometer.proto
        ../../proto/firmware/sensor/thermopile.proto
        ../../proto/firmware/sensor/sgp.proto

        ../../proto/firmware/config.proto
        ../../proto/firmware/config/blink_cfg.proto
        ../../proto/firmware/config/bme_cfg.proto
        ../../proto/firmware/config/imu_cfg.proto
        ../../proto/firmware/config/lp5523_cfg.proto
        ../../proto/firmware/config/lux_cfg.proto
        ../../proto/firmware/config/mic_cfg.proto
        ../../proto/firmware/config/sht_cfg.proto
        ../../proto/firmware/config/spectrometer_cfg.proto
        ../../proto/firmware/config/thermopile_cfg.proto
        ../../proto/firmware/config/sgp_cfg.proto

        ../../proto/bluetooth/sensor_control.proto
        ../../proto/bluetooth/packet.proto

        ../../proto/color.proto
        ../../proto/lib.proto

)
include_directories(${CMAKE_CURRENT_BINARY_DIR})

add_compile_definitions(ARM_MATH_CM4;ARM_MATH_MATRIX_CHECK;ARM_MATH_ROUNDING)
add_compile_options(-mfloat-abi=hard -mfpu=fpv4-sp-d16)
add_link_options(-mfloat-abi=hard -mfpu=fpv4-sp-d16)

add_compile_options(-mcpu=cortex-m4 -marm -march=armv7e-m -mthumb -mthumb-interwork)
add_compile_options(-ffunction-sections -fdata-sections -fno-common -fmessage-length=0)

add_compile_options($<$<COMPILE_LANGUAGE:ASM>:-x$<SEMICOLON>assembler-with-cpp>)

if ("${CMAKE_BUILD_TYPE}" STREQUAL "Release")
    add_compile_options(-Os)
else ()
    message(STATUS "Minimal optimization, debug info included")
    add_compile_options(-Og -g)
endif ()

include_directories(
        Core/Inc
        STM32_WPAN/App
        USB_Device/App
        USB_Device/Target
        Drivers/STM32WBxx_HAL_Driver/Inc
        Drivers/STM32WBxx_HAL_Driver/Inc/Legacy
        Utilities/lpm/tiny_lpm
        Middlewares/Third_Party/FreeRTOS/Source/include
        Middlewares/Third_Party/FreeRTOS/Source/CMSIS_RTOS_V2
        Middlewares/Third_Party/FreeRTOS/Source/portable/GCC/ARM_CM4F
        Middlewares/ST/STM32_WPAN
        Middlewares/ST/STM32_WPAN/interface/patterns/ble_thread
        Middlewares/ST/STM32_WPAN/interface/patterns/ble_thread/tl
        Middlewares/ST/STM32_WPAN/interface/patterns/ble_thread/shci
        Middlewares/ST/STM32_WPAN/utilities
        Middlewares/ST/STM32_WPAN/ble/core
        Middlewares/ST/STM32_WPAN/ble/core/auto
        Middlewares/ST/STM32_WPAN/ble/core/template
        Middlewares/ST/STM32_WPAN/ble/svc/Inc
        Middlewares/ST/STM32_WPAN/ble/svc/Src
        Middlewares/ST/STM32_USB_Device_Library/Core/Inc
        Drivers/CMSIS/Device/ST/STM32WBxx/Include
        Middlewares/ST/STM32_WPAN/ble
        Drivers/CMSIS/Include
        Middlewares/STM32_Calipile
        Middlewares/STM32_AS7341
        Middlewares/STM32_TSL2772
        Middlewares/STM32_BME680
        Middlewares/STM32_AdafruitSensor
        Middlewares/STM32_SHT4X
        Middlewares/Sensirion_Core/src
        Middlewares/STM32_ICM20948
        Drivers/CMSIS/DSP/Include
        Middlewares/bsec_2_2_0_0/algo/normal_version/inc
        Middlewares/STM32_SGP41
        Middlewares/gas-index-algorithm/sensirion_gas_index_algorithm
        Middlewares/bsec_2_2_0_0
        Middlewares/ST/STM32_USB_Device_Library/Class/DFU/Inc
        Middlewares/arduinojson/src
)

add_definitions(-DDEBUG -DUSE_HAL_DRIVER -DSTM32WB5Mxx)

file(GLOB_RECURSE SOURCES
        "USB_Device/*.*"
        "STM32_WPAN/*.*"
        "Core/*.*"
        "Utilities/*.*"
        "Drivers/*.*"
        "Middlewares/STM32_*/*.*"
        "Middlewares/arduinojson/src/*.*"
        "Middlewares/bsec_2_2_0_0/config/bsec_sel_iaq_18v_3s_4d/*.*"
        "Middlewares/bsec_2_2_0_0/algo/*.*"
        "Middlewares/gas-index-algorithm/sensirion_gas_index_algorithm/*.*"
        "Middlewares/Sensirion_Core/*.*"
        "Middlewares/Third_Party/*.*"
        "Middlewares/ST/*.*"
)

link_directories(Middlewares/bsec_2_2_0_0/algo/normal_version/bin/gcc/Cortex_M4F/)

set(LINKER_SCRIPT ${CMAKE_SOURCE_DIR}/STM32WB5MMGHX_FLASH.ld)

add_link_options(-Wl,-gc-sections,--print-memory-usage,-Map=${PROJECT_BINARY_DIR}/${PROJECT_NAME}.map)
add_link_options(-mcpu=cortex-m4 -mthumb -mthumb-interwork)
add_link_options(-T ${LINKER_SCRIPT})

add_executable(${PROJECT_NAME}.elf ${SOURCES} ${LINKER_SCRIPT} ${PROTO_SRCS} ${PROTO_HDRS})
target_link_libraries(${PROJECT_NAME}.elf algobsec)

set(HEX_FILE ${PROJECT_BINARY_DIR}/${PROJECT_NAME}.hex)
set(BIN_FILE ${PROJECT_BINARY_DIR}/${PROJECT_NAME}.bin)

add_custom_command(TARGET ${PROJECT_NAME}.elf POST_BUILD
        COMMAND ${CMAKE_OBJCOPY} -Oihex $<TARGET_FILE:${PROJECT_NAME}.elf> ${HEX_FILE}
        COMMAND ${CMAKE_OBJCOPY} -Obinary $<TARGET_FILE:${PROJECT_NAME}.elf> ${BIN_FILE}
        COMMENT "Building ${HEX_FILE}
Building ${BIN_FILE}")
