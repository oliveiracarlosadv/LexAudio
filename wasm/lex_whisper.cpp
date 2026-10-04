// Ponte entre o Whisper.cpp e o Lex Audio.
//
// A transcrição roda numa thread própria para que a thread principal do runtime
// (o Web Worker) continue livre para receber mensagens e repassar a saída.
// Eventos são emitidos em stdout como linhas "@@LEX{json}", que o worker
// (public/whisper/whisper-worker.js) converte em mensagens para a interface.

#include "whisper.h"

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include <algorithm>
#include <atomic>
#include <cstdio>
#include <string>
#include <thread>
#include <vector>

namespace {

whisper_context *g_ctx = nullptr;
std::thread g_worker;
std::atomic<bool> g_busy{false};
std::atomic<bool> g_cancel{false};

std::string json_escape(const char *s) {
  std::string out;
  for (; *s; ++s) {
    const unsigned char c = static_cast<unsigned char>(*s);
    switch (c) {
      case '"': out += "\\\""; break;
      case '\\': out += "\\\\"; break;
      case '\n': out += "\\n"; break;
      case '\r': out += "\\r"; break;
      case '\t': out += "\\t"; break;
      default:
        if (c < 0x20) {
          char buf[8];
          snprintf(buf, sizeof(buf), "\\u%04x", c);
          out += buf;
        } else {
          out += static_cast<char>(c);
        }
    }
  }
  return out;
}

void emit(const std::string &json) {
  printf("@@LEX%s\n", json.c_str());
  fflush(stdout);
}

void join_worker() {
  if (g_worker.joinable()) g_worker.join();
}

}  // namespace

int load_model(const std::string &path) {
  if (g_busy) return -1;
  join_worker();
  if (g_ctx) {
    whisper_free(g_ctx);
    g_ctx = nullptr;
  }
  whisper_context_params cparams = whisper_context_default_params();
  cparams.use_gpu = false;
  g_ctx = whisper_init_from_file_with_params(path.c_str(), cparams);
  return g_ctx ? 0 : 1;
}

bool is_multilingual() { return g_ctx && whisper_is_multilingual(g_ctx); }

int transcribe(const emscripten::val &audio, const std::string &language, int n_threads, bool translate) {
  if (!g_ctx) return 1;
  if (g_busy) return 2;
  join_worker();

  const size_t n = audio["length"].as<size_t>();
  std::vector<float> pcm(n);
  emscripten::val view(emscripten::typed_memory_view(n, pcm.data()));
  view.call<void>("set", audio);

  g_cancel = false;
  g_busy = true;

  g_worker = std::thread([pcm = std::move(pcm), language, n_threads, translate]() {
    whisper_full_params params = whisper_full_default_params(WHISPER_SAMPLING_GREEDY);
    params.print_realtime = false;
    params.print_progress = false;
    params.print_timestamps = false;
    params.print_special = false;
    params.translate = translate;
    params.language = whisper_is_multilingual(g_ctx) ? language.c_str() : "en";
    params.n_threads = std::max(1, n_threads);

    params.new_segment_callback = [](whisper_context *ctx, whisper_state *, int n_new, void *) {
      const int total = whisper_full_n_segments(ctx);
      for (int i = total - n_new; i < total; ++i) {
        // t0/t1 vêm em unidades de 10 ms
        const long long t0 = static_cast<long long>(whisper_full_get_segment_t0(ctx, i)) * 10;
        const long long t1 = static_cast<long long>(whisper_full_get_segment_t1(ctx, i)) * 10;
        emit("{\"type\":\"segment\",\"index\":" + std::to_string(i) +
             ",\"start\":" + std::to_string(t0) + ",\"end\":" + std::to_string(t1) +
             ",\"text\":\"" + json_escape(whisper_full_get_segment_text(ctx, i)) + "\"}");
      }
    };

    params.progress_callback = [](whisper_context *, whisper_state *, int progress, void *) {
      emit("{\"type\":\"progress\",\"value\":" + std::to_string(progress) + "}");
    };

    params.abort_callback = [](void *) -> bool { return g_cancel.load(); };

    const int rc = whisper_full(g_ctx, params, pcm.data(), static_cast<int>(pcm.size()));
    const int lang_id = whisper_full_lang_id(g_ctx);
    const char *lang = lang_id >= 0 ? whisper_lang_str(lang_id) : "";

    emit("{\"type\":\"done\",\"code\":" + std::to_string(rc) +
         ",\"canceled\":" + (g_cancel.load() ? "true" : "false") +
         ",\"language\":\"" + json_escape(lang ? lang : "") + "\"}");
    g_busy = false;
  });

  return 0;
}

void cancel() { g_cancel = true; }

EMSCRIPTEN_BINDINGS(lex_whisper) {
  emscripten::function("loadModel", &load_model);
  emscripten::function("isMultilingual", &is_multilingual);
  emscripten::function("transcribe", &transcribe);
  emscripten::function("cancel", &cancel);
}
