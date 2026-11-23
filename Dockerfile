# Maintainer: HafzalBZ — https://github.com/HafzalBZ
FROM emscripten/emsdk:4.0.10@sha256:90b757eb11fa9a0e3ce4d2d9f76d932a56018e4accc37b5a28b2783751e60eb7 AS build

ARG QPDF_VERSION=12.4.2
ARG QPDF_SHA256=8a58af5b6141319287c1883bec8bd1bd545b7567b7fc5e6ce5d25a1c85f36397
ARG ZLIB_VERSION=1.4
ARG ZLIB_SHA256=02dd159783677a749c04adbdd02b55b8a2bcc7e054f51b76b549199a916ad584
ARG JPEG_VERSION=3.2.1
ARG JPEG_SHA256=c27ad72a68da151177929aa969ae773a2da5ac2af9ce946079314fdac8cece7f

RUN apt-get update && apt-get install -y --no-install-recommends \
      curl ninja-build pkg-config ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /work

# Download official upstream release archives and reject any hash mismatch.
RUN curl -fsSLo zlib.tar.gz "https://github.com/madler/zlib/releases/download/v${ZLIB_VERSION}/zlib-${ZLIB_VERSION}.tar.gz" \
 && echo "${ZLIB_SHA256}  zlib.tar.gz" | sha256sum --check --strict \
 && tar -xzf zlib.tar.gz \
 && mv "zlib-${ZLIB_VERSION}" zlib \
 && curl -fsSLo jpeg.tar.gz "https://github.com/libjpeg-turbo/libjpeg-turbo/releases/download/${JPEG_VERSION}/libjpeg-turbo-${JPEG_VERSION}.tar.gz" \
 && echo "${JPEG_SHA256}  jpeg.tar.gz" | sha256sum --check --strict \
 && tar -xzf jpeg.tar.gz \
 && mv "libjpeg-turbo-${JPEG_VERSION}" jpeg \
 && curl -fsSLo qpdf.tar.gz "https://github.com/qpdf/qpdf/releases/download/v${QPDF_VERSION}/qpdf-${QPDF_VERSION}.tar.gz" \
 && echo "${QPDF_SHA256}  qpdf.tar.gz" | sha256sum --check --strict \
 && tar -xzf qpdf.tar.gz \
 && mv "qpdf-${QPDF_VERSION}" qpdf

RUN cd zlib \
 && emconfigure ./configure --static --prefix=/deps \
 && emmake make -j2 \
 && emmake make install

RUN emcmake cmake -S jpeg -B jpeg-build -G Ninja \
      -DCMAKE_BUILD_TYPE=Release \
      -DCMAKE_INSTALL_PREFIX=/deps \
      -DENABLE_SHARED=OFF \
      -DENABLE_STATIC=ON \
      -DWITH_TOOLS=OFF \
      -DWITH_TESTS=OFF \
 && cmake --build jpeg-build \
 && cmake --install jpeg-build

ENV PKG_CONFIG_PATH=/deps/lib/pkgconfig

RUN emcmake cmake -S qpdf -B qpdf-build -G Ninja \
      -DCMAKE_BUILD_TYPE=Release \
      -DCMAKE_CXX_FLAGS=-fexceptions \
      -DCMAKE_PREFIX_PATH=/deps \
      -DCMAKE_INSTALL_PREFIX=/deps \
      -DBUILD_SHARED_LIBS=OFF \
      -DBUILD_STATIC_LIBS=ON \
      -DBUILD_DOC=OFF \
      -DREQUIRE_CRYPTO_NATIVE=ON \
      -DUSE_IMPLICIT_CRYPTO=OFF \
 && cmake --build qpdf-build --target libqpdf \
 && cmake --install qpdf-build --component dev

COPY src/pdf_decrypt.cpp /work/pdf_decrypt.cpp

RUN em++ /work/pdf_decrypt.cpp \
      /deps/lib/libqpdf.a /deps/lib/libz.a /deps/lib/libjpeg.a \
      -I/deps/include \
      -O3 -flto -fexceptions \
      -sMODULARIZE=1 \
      -sEXPORT_ES6=1 \
      -sENVIRONMENT=worker \
      -sALLOW_MEMORY_GROWTH=1 \
      -sFILESYSTEM=0 \
      -sMALLOC=emmalloc \
      -sEXPORTED_FUNCTIONS='["_malloc","_free","_decrypt_pdf","_decrypt_result_data","_decrypt_result_size","_decrypt_error_code","_decrypt_result_free"]' \
      -sEXPORTED_RUNTIME_METHODS='["UTF8ToString","HEAPU8"]' \
      -o /work/pdf-decrypt.js

FROM scratch AS artifacts
COPY --from=build /work/pdf-decrypt.js /
COPY --from=build /work/pdf-decrypt.wasm /
