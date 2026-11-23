// Copyright (c) 2026 HafzalBZ. SPDX-License-Identifier: MIT
#include <qpdf/QPDF.hh>
#include <qpdf/QPDFExc.hh>
#include <qpdf/QPDFWriter.hh>

#include <emscripten/emscripten.h>

#include <cstddef>
#include <cstdint>
#include <cstring>
#include <memory>
#include <string>

namespace {
std::unique_ptr<unsigned char[]> result;
std::size_t result_size = 0;
std::string error_code;

void clear_result()
{
    if (result && result_size) {
        std::memset(result.get(), 0, result_size);
    }
    result.reset();
    result_size = 0;
    error_code.clear();
}
}

extern "C" {

EMSCRIPTEN_KEEPALIVE
int decrypt_pdf(
    std::uint8_t const* input,
    std::size_t input_size,
    char const* password)
{
    clear_result();

    if (!input || input_size == 0 || !password) {
        error_code = "INVALID_ARGUMENT";
        return 1;
    }

    try {
        QPDF pdf;
        pdf.setSuppressWarnings(true);
        pdf.setMaxWarnings(100);
        pdf.processMemoryFile(
            "browser-upload",
            reinterpret_cast<char const*>(input),
            input_size,
            password);

        QPDFWriter writer(pdf);
        writer.setOutputMemory();
        writer.setPreserveEncryption(false);
        writer.write();

        auto buffer = writer.getBufferSharedPointer();
        result_size = buffer->getSize();
        result = std::make_unique<unsigned char[]>(result_size);
        std::memcpy(result.get(), buffer->getBuffer(), result_size);
        return 0;
    } catch (QPDFExc const& exception) {
        // QPDF currently reports password failure through its exception text.
        // Keep the parsing confined to this adapter so JS has stable codes.
        std::string message = exception.what();
        if (
            message.find("invalid password") != std::string::npos ||
            message.find("incorrect password") != std::string::npos) {
            error_code = "WRONG_PASSWORD";
            return 2;
        }
        error_code = "INVALID_PDF";
        return 3;
    } catch (...) {
        error_code = "PROCESSING_FAILED";
        return 4;
    }
}

EMSCRIPTEN_KEEPALIVE
std::uint8_t const* decrypt_result_data()
{
    return result.get();
}

EMSCRIPTEN_KEEPALIVE
std::size_t decrypt_result_size()
{
    return result_size;
}

EMSCRIPTEN_KEEPALIVE
char const* decrypt_error_code()
{
    return error_code.c_str();
}

EMSCRIPTEN_KEEPALIVE
void decrypt_result_free()
{
    clear_result();
}
}
