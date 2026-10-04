cmake_minimum_required(VERSION 3.13)
project(lex-whisper CXX C)

if (NOT EMSCRIPTEN)
  message(FATAL_ERROR "Use emcmake: o alvo lex-whisper só é compilado para WebAssembly.")
endif()

set(CMAKE_CXX_STANDARD 17)
set(BUILD_SHARED_LIBS OFF CACHE BOOL "" FORCE)
set(WHISPER_BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(WHISPER_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
set(WHISPER_BUILD_SERVER OFF CACHE BOOL "" FORCE)

# SIMD + threads em todo o código (whisper, ggml e a ponte)
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -pthread -msimd128")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -pthread -msimd128")

add_subdirectory(whisper.cpp)

add_executable(lex-whisper lex_whisper.cpp)
target_link_libraries(lex-whisper PRIVATE whisper)
set_target_properties(lex-whisper PROPERTIES SUFFIX ".js")
target_link_options(lex-whisper PRIVATE
  --bind
  -O3
  -pthread
  -sPTHREAD_POOL_SIZE_STRICT=0
  -sENVIRONMENT=web,worker
  -sALLOW_MEMORY_GROWTH=1
  -sINITIAL_MEMORY=256MB
  -sMAXIMUM_MEMORY=4GB
  -sSTACK_SIZE=1MB
  -sDEFAULT_PTHREAD_STACK_SIZE=2MB
  -sFORCE_FILESYSTEM=1
  -sEXIT_RUNTIME=0
  "-sEXPORTED_RUNTIME_METHODS=['FS']"
)
