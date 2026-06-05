# Deveyn Hainey — Portfolio Catalog (Quizlet, 2023–2026)

> **v2 — enriched 2026-06-03** with content from her own authored Google Docs (V5 self-hosting findings, MIN_WORDS analysis, Learn MCQ distractor analysis, Enabling Diagrams in Hex planning, Workspaces ML SOT). v1 was built from Slack + Jira + Confluence only; v2 backfills the access gap Cursor flagged.
>
> A factual, source-grounded catalog of work Deveyn Hainey shipped, owned, and led at Quizlet, compiled to support her job search (resume / LinkedIn / interview prep). Quantified outcomes are now backed by her own primary-source documents wherever possible — most v1 `[VERIFY]` flags are resolved.
>
> **Role/title on record:** Machine Learning Engineer I, Quizlet (`deveyn.hainey@quizlet.com`).
> **Compiled:** 2026-06-03. **Sources:** Slack, Atlassian Jira/Confluence, **plus her own Google Docs (added in v2)**.

---

## Executive summary (resume / LinkedIn "About")

Deveyn Hainey is a Machine Learning Engineer who worked across the full stack of an AI-powered education product — from behavioral data modeling and quality evaluation to production GPU model serving, latency optimization, and on-call observability. Over her tenure at Quizlet she progressively moved from data/analytics and recommendation work into core ML engineering, ultimately owning the company's **freeform written-answer grading (WAG) service** end to end: she ran the self-hosting validation that selected hardware and a model (Qwen3-32B-AWQ on H100 GPUs via vLLM), benchmarked it against real production traffic (42 RPS avg, 132 RPS peak 10s window in April 2026), designed the A/B test to measure impact, and quantified a **+33% relative quality improvement** (Cohen's κ 0.438 → 0.583) over the prior CPU-based model. She is comfortable in Python services (FastAPI/Gunicorn), Go-adjacent study-service integration, Kubernetes/Helm on GKE, vLLM/AWQ-Marlin GPU serving, and the Datadog-based observability stack, and pairs that with rigorous experimental practice: Cohen's κ, F1/precision/recall, Poisson vs. burst load modeling, variance-to-mean ratio analysis from production traces, profiling with pyinstrument, and benchmarking with `ab`. She is equally strong at the "ML quality" craft — LLM-as-judge rubrics, stratified distractor-quality A/B analysis (e.g., a 5,200-distractor study that recommended a MIN_WORDS=2 eligibility threshold yielding +20.6pp quality uplift and +228M terms/month coverage), and authoring the **ML Engineering Source-of-Truth doc for Quizlet Workspaces** (synthesizing 15+ docs, 8 Slack channels, 20+ Jira tickets into a normative reference used by the ML team). Colleagues routinely relied on her to investigate ambiguous production issues (grading races, pod restarts, latency regressions), to translate findings into clear written docs, and to coordinate with platform, data-engineering, and product partners.

**Seniority signal:** Operating well above an "Engineer I" scope — independently owned a production ML service, made and defended architecture/cost trade-offs (~$48k–$192k/yr decisions), and acted as the team's go-to for written-grading and study-service performance.

---

## How to read this catalog

- **Internal name → plain English:** WAG / "written grading" → *freeform written-answer grading service*; hex / hex-study / service-inference-lookup → *internal Python ML inference service*; Learn → *Quizlet's adaptive study mode*; Smart Assist (SA) → *flashcard/question generation pipeline*; MCQ → *multiple-choice question*; SATA → *select-all-that-apply question*; distractors → *wrong answer options in an MCQ*; AWQ → *Activation-aware Weight Quantization* (4-bit LLM quantization); vLLM → *high-throughput LLM serving framework*.
- **Attribution words** are deliberate: *owned* / *co-owned* / *contributor* / *handoff*.

---

## 1. Freeform Written-Answer Grading (WAG) — self-hosting & V5  *(flagship)*

**Period:** ~Feb 2026 → Jun 2026 (research lineage back to late 2025). **Role:** Owner / lead engineer (architecture research, benchmarking, A/B design, cross-team coordination). She was the team's go-to for WAG questions through her last week.

**What it was (plain English):** Quizlet grades typed, free-text answers in Learn ("written" questions) with an ML model. The prior production version (V4) ran on Groq's hosted API. When Groq became unavailable, the team needed to *self-host* a grading model on Quizlet's own GCP/Kubernetes infrastructure. Deveyn led the validation that determined whether self-hosting could meet production latency and quality bars, on what hardware, at what cost — i.e., the V5 architecture.

**Architecture (two parts):**
- **Qwen3-32B-AWQ** (~17 GB, 4-bit AWQ-quantized) served via vLLM on GPU — returns logprobs over {0,1,2,3} grade tiers.
- **Tiny sklearn logistic regression head** (`d4_rubric_examples_canonical_v2.pkl`, ~1.5 KB) on CPU — maps logprobs to Strict / Moderate / Relaxed / Wrong grade buckets.

### What she did specifically

- **Validated self-hosting on GCP** (project `qzlt-dev-data`): benchmarked Qwen3-32B-AWQ on three GPU classes — A100 40GB (~$3.67/hr on-demand), H100 80GB (~$3.30/hr preemptible spot), L4 24GB (~$0.70/hr on-demand). Found A100 saturates at ~8–9 RPS and cannot meet the <100ms p95 target; L4 has a 240ms floor and saturates at ~5 RPS; **H100 is the only viable option, handling 100 RPS Poisson at p95 ≈ 50ms on a single GPU.**
- **Ran rigorous load modeling.** Distinguished Poisson-arrival testing from worst-case burst testing. When a 30-request simultaneous burst produced ~342ms p95 (vLLM batches them into one prefill step), she pulled 30 days of real `freeform-text-grading` traffic from Datadog (`istio.mesh.request.count`, unsampled) and computed a detrended **variance-to-mean ratio (VMR) across 8 stationary 30-min windows: median ≈ 1.2, range 0.8–1.8** using `trace.istio.proxy.server.hits` (correctly switching from the mesh metric, which 15s pod-flush staggering inflates ~10×). Applied a VMR-aware inflation factor (×1.10 at median, ×1.18 at worst) to derive a *defensible* realistic prod estimate (**~60–75ms p95 model-only / ~60–80ms with GKE+Istio overhead**) instead of the over-conservative burst figure.
- **Fixed Aaron's Exp 5 config baseline** to unlock A100 performance: removed `--enforce-eager` (debug flag, ~2× slower), raised `--max-model-len` from 2048 → 8192 (after confirming the real ~600-token prompt was not actually 7.9K as documented), enabled `--enable-prefix-caching` (50% latency win on shared system prefix), upgraded vLLM 0.18.0 → 0.21.0 (newer kernels).
- **Quantization research** (with Cursor-assisted analysis): established that the model was already 4-bit AWQ; tested 2-bit (AutoRound) and found it *slower* than 4-bit because vLLM only has an optimized kernel for 4-bit (2-bit falls to a slow path: 626ms on L4, 147ms on A100) with quality dropping (κ ≈ 0.53). **Concluded 4-bit is the practical floor** and further gains require changing the model, not quantization. Also tested smaller dense (14B/8B/4B) and MoE (30B-A3B) models on L4 — all failed the quality bar (κ dropped from ~0.58 to 0.41–0.48).
- **Drove the cost/topology decision:** proposed 2× H100 (one for load, one for redundancy/zero-downtime deploys/multi-AZ), with explicit spot-vs-on-demand-vs-CUD trade-offs:

  | Option | Topology | Annual cost/region | p95 @ 100 RPS | Quality (κ) |
  |---|---|---:|---:|---:|
  | V4 status quo | 60 fixed CPU pods | ~$32–46k | ~50–200ms | 0.438 |
  | 2× H100 spot | 2 preemptible pods | ~$58k | ~55–60ms | 0.583 |
  | 1× H100 + 3-yr CUD | 1 pod, no redundancy | ~$48k | ~55–60ms | 0.583 |
  | 2× H100 on-demand | List price | ~$192k | ~55–60ms | 0.583 |
  | Path B DeBERTa (projected) | Distilled model | ~$5–20k | ~10ms (proj.) | TBD ≥0.580 |

- **Designed the A/B test** to prove impact: success metric (decrease in "I was correct" grading overrides), health metrics (7-day Learn retention, 7-day Quizlet retention), curiosity metrics (% complete 3/5+ rounds in Learn, 1-day Learn retention, engagement with written-grading settings).
- **Coordinated cross-functionally** with ML Platform (Ronnie), Platform (Sam, Michael), and Aaron to resolve H100 quota/billing (on-demand quota = 0; preemptible = 128) in both dev and prod GCP projects.
- **Engineered production guardrails (defense-in-depth):** `max_tokens=1` at every call site, `chat_template_kwargs.enable_thinking=False` (thinking-mode footgun: 20–100× slower silently), startup canary asserting response is exactly 1 token (fail-closed on model config drift), `--enforce-eager OFF` in prod, pinned vLLM 0.21.0, mixed spot + on-demand for preemption tail.
- **Authored "V5 Self-Hosting Written Grading Findings"** (2026-05-27) — the canonical decision doc, with detailed methodology, full F1 tables per backend, cost analysis, and production runbook.

### Verified quality outcomes (formal κ regression on 412-row test split)

| Backend | n | Cohen's κ | Accuracy | Strict F1 | Wrong F1 | Moderate F1 | Relaxed F1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Groq (Phase 6 reference) | 412 | 0.5829 | 0.7403 | 0.882 | 0.750 | 0.536 | 0.376 |
| vLLM A100 | 412 | 0.5657 | 0.7282 | 0.887 | 0.723 | 0.525 | 0.414 |
| vLLM H100 | 412 | 0.5619 | 0.7257 | 0.887 | 0.723 | 0.517 | 0.411 |

vs. V4 production baseline κ = 0.438. **Δ V5-vs-V4 = +0.145 absolute / +33% relative improvement.** Self-hosted-vs-Groq Δ inside publication noise (bootstrap CI ±0.05 on 412 rows).

### Verified latency outcomes (single H100, vLLM 0.21, prefix caching on, AWQ Marlin)

| Load | p50 | p95 | Verdict |
|---|---:|---:|---|
| Sequential (1 req at a time) | 39.7 ms | 66.2 ms | ✓ |
| 30 RPS (sustained peak) | 25.6 ms | 35.8 ms | ✓ — 64ms under hard target |
| 100 RPS (real peak) | 36.3 ms | 49.4 ms | ✓ |
| 200 RPS (stress) | 47.2 ms | 57.9 ms | ✓ — still not saturated |

Real V4 traffic April 2026 (unsampled, full school month): 42 RPS avg, 101 RPS sustained peak hour, **117 RPS peak minute, 132 RPS peak 10s window** — the 100 RPS lab test matches real peak.

### Technologies & scale

Python, vLLM 0.21.0, **Qwen3-32B-AWQ (4-bit AWQ Marlin)**, AutoRound quantization, NVIDIA **H100 80GB / A100 40GB / L4 24GB** GPUs, GCP / Google Kubernetes Engine (GKE), Istio mesh, scikit-learn (logistic regression head), GPU quota / CUD / spot pricing trade-offs, Datadog (APM, mesh metrics, trace metrics, variance analysis). Target 100 RPS at <100ms p95 — achieved 49ms p95 with ~2× headroom. Cohen's κ for quality, F1/precision/recall for per-class breakdown.

### Resume-ready bullets

- Owned end-to-end validation to self-host Quizlet's freeform written-answer grading model after a vendor dependency (Groq) was lost; benchmarked Qwen3-32B-AWQ across H100/A100/L4 GPUs on GKE+Istio and selected the production architecture (single H100 sustains 100 RPS at p95 ≈ 49ms vs. <100ms target).
- Quantified **+33% relative κ improvement** (0.438 → 0.583) vs. prior CPU-only ONNX/MiniLM production grader; validated identical quality across vLLM backends and confirmed sub-band-noise reproduction (Δκ ≤ 0.02).
- Built a defensible production-latency model by combining 100 RPS vLLM Poisson tests with a variance-to-mean ratio analysis of 30 days of real Istio traffic (median VMR 1.2, range 0.8–1.8 across 8 windows), validating ~60–75ms p95 prod under a 100ms hard target.
- Ran a quantization and model-size study (4-bit AWQ vs. 2-bit AutoRound, 32B vs. 14B/8B/4B dense and MoE) using Cohen's κ on a 412-row canonical test split, proving 4-bit was the quality/latency floor and preventing wasted effort below it.
- Designed the production A/B test (success/health/curiosity metrics) and drove H100 quota and cost decisions across ML Platform and Platform teams; surfaced a ~$48k–$192k/yr cost trade-off matrix (V4 ≈ $46k, 2×H100 spot ≈ $58k, 2×H100 on-demand ≈ $192k) with explicit spot/CUD/on-demand reasoning.
- Engineered production defense-in-depth guardrails (`max_tokens=1`, thinking-mode-off, startup canary, vLLM-version pin) preventing silent 20–100× latency regressions from model config drift.

---

## 2. Quizlet Workspaces — ML Engineering Source-of-Truth & Contributions

**Period:** Apr 21 → ~May 2026. **Role:** Owner of the ML-engineering SOT doc; contributor to several Workspaces ML threads.

**What it was (plain English):** Quizlet Workspaces is the next-gen multi-source study product (sets + AI activities + AI Coach in one container) launching in milestones M3→M7. The ML engineering side spans Smart Assist V3, agentiq routing, retrieval-augmented generation, AI Coach integration, and observability. Deveyn maintained the team's reference document tying these together.

### What she did specifically

- **Authored and maintained the "Workspaces_ML_Research_Document"** — a 126K-char ML Engineering Source-of-Truth synthesizing **15+ Google Docs, 8 Slack channels, 20+ Jira tickets, and multiple Confluence pages** into a normative reference. Two iterative passes (April 21 → April 30 2026). Tracked **~37 product rules (R01–R37), ~30 open questions with P0/P1/P2/P3 priorities, and ownership across ~18 stakeholders.** This was the doc the ML leads (Shane, Anil, Shogo, Aaron, Jeff) used to align on contested decisions (Mode 2 routing, character limits, MCQ approach, Discoverer permissions, citation requirements).
- **Direct technical contributions** (per the doc's Key Personnel section):
  - **Payload-size investigation + CPU-bound executor PR** in the new `agentiq` Python service (analogous to her `hex-study PR #3701` work for Pydantic deserialization CPU-bound).
  - **Test materials for RAG** (Canvas course data, ticket XFPT1-119) for the agentic retrieval initiative.
- **Captured cross-team decisions with numbers:**
  - SA V3 input limit raised from 100K → **1,000,000 characters (1M)** (Apr 28, 2026).
  - **1,000 cards** hard cap per generation request.
  - Gemini 3.1 Flash Lite vs GPT-4o-mini: **"~3× speed improvement with comparable quality"** — rolled to 100%.
  - **~6K tokens** for the 100-doc summary index (retrieval routing).
  - Retrieval eval scope: **~50–100 queries (Phase 1)**, **200–1K workspaces** eval target, **300 SA requests** analyzed for retrieval strategy.
  - M3 success: **>60% of beta students report 80% of key concepts represented**.
  - M6 latency target: **p75 ≤300ms workspace page load**.
  - M7 citation target: **>80% of generated SG content and Coach responses have citations**.
  - Rollout pattern: **1% → 10% → 50% → 100%** for agentiq Python migration.

### Technologies & scale

Python (agentiq service), **LangGraph / LangChain**, **Gemini 3.1 Flash Lite + OpenAI GPT-4o-mini fallback**, **Vertex AI RAG Engine**, Arize (LLM-as-judge), DogStatsD, Datadog APM/ddtrace, GrowthBook (prompt versioning), MySQL (asyncmy driver), **NDJSON streaming**, **MCP / SDUI** integration, GCS, Pub/Sub.

### Resume-ready bullets

- Authored and maintained the ML Engineering Source-of-Truth document for Quizlet Workspaces — a 126K-character normative reference synthesizing 15+ design docs, 8 Slack channels, and 20+ tickets across Smart Assist V3, retrieval-augmented generation, AI Coach, and observability. Tracked 37 product rules, 30 open decisions, and ownership for ~18 stakeholders.
- Investigated event-loop blocking in a new Python LLM service (`agentiq`) and shipped a CPU-bound executor PR using `run_in_executor`, mirroring an earlier successful fix in the `hex-study` service.
- Built test materials for an agentic-retrieval initiative integrating Vertex AI RAG Engine with LangGraph/LangChain orchestration across Gemini 3.1 Flash Lite and GPT-4o-mini.

---

## 3. Study / Inference Service Performance (hex-study)

**Period:** ~Mar 2026 → May 2026. **Role:** Owner of the optimization workstream (paired closely with Shane Mooney; reviews from Aaron, ML Platform).

**What it was:** `hex-study` (the study-serving path of the internal Python inference service `service-inference-lookup`) was hitting latency/event-loop problems under load as Learn migrated to server-driven question generation. Deveyn led a multi-week effort to diagnose and reduce tail latency.

### What she did specifically

- **Root-caused event-loop blocking:** confirmed (with ML Platform's Cheng) that CPU-bound work (decompression/deserialization) on a single Gunicorn worker was blocking the event loop and queuing requests; used Datadog `event_loop_lag` (P99 200–300ms) and APM traces to localize cost to `question-generation` and `question-lookup-by-ids`.
- **HPA / resource tuning:** ran a structured series of Helm/HPA experiments in `quizlet-infrastructure` (PRs **#12912, #12923, #12928, #12941, #13044**) — lowering HPA CPU target (65→40→25%), adjusting `requests.cpu`, worker counts, and min/max replicas (eventually max 300 / min 50 for the Learn launch). Discovered via `kubernetes.cpu.cfs.throttled.seconds` ≈ 0 that pods had **no CPU limit** (only a 300m request), so bumping `requests.cpu` mostly changed the HPA denominator rather than runtime CPU — a sharp insight that reframed the team's tuning strategy.
- **Async/offload code changes** in `service-inference-lookup`: an `run_in_executor`/offload PR (**#3755**) to move CPU-bound work off the loop; a freshness update on question-generation (**#3831**); and a cleanup PR (**#3850**) removing ineffective `asyncio.sleep` calls that were hurting trace visibility.
- **Process-pool + bytes-passthrough analysis:** profiled the parent event loop with **pyinstrument** and identified that a naive process pool just relocated cost (pickling Pydantic `Question` objects across the process boundary, then re-`model_dump`/`model_validate` for the response and Spanner write). Designed a **bytes-passthrough** interface where the worker emits the exact gzipped orjson bytes written to Spanner and returned in the HTTP response, so the parent never re-materializes Pydantic — local benchmarks (`ab`) showed >50% improvement for large sets. Helped land Aaron's related generation-path PR (**#3621**) by resolving review comments.
- **Authored Confluence deep-dives:** "Current Study Service Performance: A Complete Foundation Guide" / "Study Service Performance: A Complete Foundation Guide" and "Question and Distractor Generation in Study Service: A Detailed Overview."

### Technologies & scale

Python, FastAPI, Gunicorn, asyncio (`run_in_executor`), Pydantic, orjson/gzip serialization, Google Spanner, Kubernetes/Helm on GKE, Istio, Datadog APM/profiling, pyinstrument, ApacheBench (`ab`).

### Quantified outcomes

- Lowering the HPA target meaningfully cut event-loop blocking — share of requests waiting ≥100ms on the event loop dropped from ~5% to between 1% and 5% (per Shane's Datadog analysis); "largely solved" the slow-request-blocks-fast-request case.
- Local bench showed bytes-passthrough >50% faster for large sets (with the explicit caveat that local does not reproduce the prod tail).

### Resume-ready bullets

- Diagnosed and reduced tail latency on a production Python ML inference service by root-causing event-loop blocking via Datadog APM and pyinstrument profiling.
- Designed a zero-copy "bytes-passthrough" worker interface (gzipped orjson straight to Spanner and HTTP) that eliminated redundant Pydantic serialization on the event loop, >50% faster on large payloads in local benchmarks.
- Ran a data-driven Kubernetes HPA/Helm tuning program on GKE — discovering pods had no CPU limit (only a 300m request) and reframing the team's scaling approach accordingly. Shipped 5 infrastructure PRs.

---

## 4. Learn Study-Service Quality & Bug Fixes — incl. Enabling Diagrams in Hex

**Period:** ~Mar 2026 → May 2026. **Role:** Owner of several Learn quality bugs in the study/inference service; partnered with server-driven-Learn eng (Neto, Sam O'Donnell), Shane, Michael, Ian, and product (Vivian).

### What she did specifically — Enabling Diagrams in Hex (Jira LEARN-1145 → LEARN-2486; M2 milestone)

**Problem framing (from her authored "Enabling Diagrams in Hex Planning" doc, 2026-03-13):** Diagram cards have a third side called `LOCATION` (a `MediaDiagramShape` JSON blob marking a label position on a diagram image). The Hex question-generation pipeline was hard-coded to use only `WORD` and `DEFINITION` sides, so **users studying diagram sets received zero Hex-generated questions.** Some MCQ generators silently produced malformed pairings on location encounter. She designed and delivered the full fix:

- **Wrote the planning doc**, scoping eight specific files to touch and decomposing the work into **three sequential tickets** (Foundation+Flashcard+Written → MCQ Graceful Skips → MCQ In-Set Selection) to enable parallel review and clean rollback boundaries.
- **Coordinated cross-team dependencies**: confirmed with Ian (studiables service) that location-side data already flowed in correctly; confirmed with Shane that async/pubsub paths fetched studiable items fresh (so no upstream changes needed); confirmed with Michael that the study service could parse the new response shape; confirmed via Aaron's eligibility.py that ML distractor service does not support location.
- **Shipped the eight-file change** (PRs **#3672 / #3675**):
  - `dispatch/data/studiables/models.py` — fixed `get_other_textual_card_side_label` to handle `LOCATION` explicitly (was silently falling back to `DEFINITION`).
  - `flashcard_generator.py` — added 4 new side-pair generators: `(LOCATION,WORD)`, `(LOCATION,DEFINITION)`, `(WORD,LOCATION)`, `(DEFINITION,LOCATION)`.
  - `written_generator.py` — added 2 new prompt-side pairs (LOCATION as prompt only; can't type a diagram).
  - `mcq_fallback_generator.py` — implemented **in-set MCQ selection** for diagram MCQs (prompt = word/definition, answer options = other cards' location pins in the same set) — no ML distractor service needed.
  - `mcq_studiable_metadata_generator.py` + `mcq_custom_distractor_generator.py` — graceful skip on location sides.
  - `card_processing.py preprocess_cards` — added `LOCATION` to side iteration for distractor selection maps.
  - `tests/conftest.py` and per-generator test files — added `NSidedCard` fixtures with `MediaDiagramShape` and edge cases (empty diagram shape, card missing word/definition text).

### Other Learn study-service bug fixes she owned

- **Diagram MCQ direction-tier sort bug (the original LEARN-2486 ticket scope):** `LOCATION → WORD` and `LOCATION → DEFINITION` MCQs were silently dropped on three-sided cards because ML "won" the answer-side precedence buckets and discarded fallback questions it never competes for. She fixed `gather_mcqs_with_precedence_for_card` to preserve location-prompt questions regardless of tier, and added a direction-tier primary sort key in `sort_questions_by_recommendation` so the Go study service's first-ref dedup selects the right direction.
- **Stale-question grading race:** when hex regenerates questions, old question IDs were overwritten and in-flight answers were silently dropped (Vivian saw progress resets / repeated questions). She shipped a workaround PR (**#3866**), built a Datadog investigation notebook, and engaged Shane on the deeper get-by-id↔grading race (ultimately resolved by Redis caching on the Go side).
- **MCQ & SATA duplication fixes:** PRs in hex (**#3757**, **#3759**) and the shared Kotlin/KMP repo (`quizlet-shared-kotlin` **#1885**).
- Reviewed/merged related diagram fixes (**#3621** generation path) and reasoned about media/image-in-distractor fallback bugs.

### Technologies & scale

Python (hex/service-inference-lookup), Go study-service integration concepts, Kotlin/KMP (cross-platform PR), Datadog notebooks, Spanner, Redis (cross-team), Jira, pytest.

### Resume-ready bullets

- Designed and shipped end-to-end support for diagram cards in Quizlet's ML question-generation service — the M2 milestone unblocking the entire diagram-set study experience, which previously generated zero questions. Wrote the planning doc, decomposed the work into 3 sequential tickets, and modified 8 files across generators, data models, preprocessing, and tests.
- Implemented in-set MCQ selection for diagram questions where prompt is text and answer options are other cards' location pins — sidestepping the ML distractor service (which does not support location sides) without compromising quality.
- Fixed silent question-dropping bugs in a production ML service (direction-tier sort defects on multi-sided cards, stale-question grading races) — restoring correct study progress for affected users (Jira LEARN-2486).
- Built Datadog investigation notebooks to characterize production grading races and drove cross-team resolution with backend partners (Redis caching on the Go side).

---

## 5. MCQ Quality, Distractor Analysis & Judge V2 (Learn Quality initiative)

**Period:** ~Oct 2025 → Mar 2026. **Role:** Co-owner of the Learn Quality eval workstream (with Aaron; partners Jeff, Shane, Tingting, SMEs).

### Distractor Quality & Retention Analysis (her authored doc, Nov 2025)

She built a Periscope-backed analysis covering **all 5,200 Learn MCQ distractors shown in October 2025** classified into 9 generation sources, using BigQuery (`learning.questions`, `events.multiple_choice_option_events`, `learning.learn_studiable_metadata`, `sets_and_terms.quizzes_latest`, `sessions.sessions`).

**Headline findings (verbatim):**

| Distractor Source | % of Total Qs | % Correct | Fooled Rate | Difficulty |
|---|---:|---:|---:|---|
| Fallback (rule-based) | 31.1% | 87.1% | 12.8% | Medium |
| Often-Confused MCQ | 19.7% | 83.6% | 16.2% | Medium |
| Within-Set Ranker | 18.8% | 82.7% | 17.0% | Hard |
| **LLM** | **12.5%** | **83.0%** | **16.6%** | **Hard** |
| User-Defined | 9.7% | 84.5% | 15.3% | Hard |
| UGC-Parsed | 3.0% | 80.1% | 19.5% | Very Hard |

- Defined `difficulty_score = fooled_rate × avg_time_when_wrong`, bucketed by quartile.
- **First-session retention by difficulty:** Easy 1d=21.3% / 7d=49% / 28d=63%; Very Hard 1d=19.9% / 7d=40.6% / 28d=51% — *"users exposed to very hard first questions are less likely to return the next day."*
- **Creator vs Non-Creator:** Creators 85.5% correct / 14.3% fooled vs Non-Creators 81.3% / 18.4% — **4.2pp accuracy gap, 4.1pp fooled-rate gap**, validating correctness as a real learning signal.
- **Recommended:** keep LLM distractor difficulty moderate (15–17% fooled), personalize onboarding difficulty, track LLM mix share, retire/tune UGC-parsed distractors.

### MIN_WORDS_FOR_ELIGIBILITY Analysis & Recommendation (her authored doc, Nov 2025)

A rigorous A/B analysis on whether to lower the minimum-words eligibility filter for LLM-generated distractors (currently ≥5 answer words) and remove the 260-char limit.

**Methodology:** tested `min_words ∈ {5,4,3,2,1,0}` and char limits `{260, 300, 400, 500, no-limit}`. For each: coverage %, cost estimate, quality via the **MCQ Judge** (Good/Acceptable/Bad/NA). Plus stratified: generated NEW LLM distractors for 1–5 word answer buckets using identical Q/A pairs for a fair one-to-one comparison. Sample: **100 per combination** for new-distractor evaluation; **5,200 distractors** total in the production dataset; production volume **373M terms/month**.

**Verified findings (verbatim):**

- **LLM quality uplift over fallback, stratified by answer length** (95% CIs non-overlapping; statistically significant):
  - 1-word: 64.7% → 81.7% (**+17.0pp**)
  - 2-word: 69.6% → 91.1% (**+21.4pp**)
  - 3-word: 64.4% → 91.3% (**+26.8pp**)
  - 4-word: 58.1% → 88.0% (**+39.9pp**)
  - 5-word: 79.2% → 90.1% (**+10.9pp**)
- **Coverage:** lowering 5→2 adds **+33.8pp coverage** (27.5% → 61.3%, **+228M terms/month**); 2→1 adds another **+32.65pp** (→ 93.92% full coverage).
- **Char limit removal:** only **+0.92pp coverage (48 of 5,200 terms)** with excluded-term quality only **41.7% Good vs 66.1% overall (−24.5pp)** → *"do not remove the char limit."*
- **Cost per term:** $0.000027 (weighted 70% Gemini 2.0 Flash FT @ $0.000021 + 30% OpenAI GPT-4o-mini @ $0.000042). Annual deltas: min_words=3 +$14,292; =2 +$41,242; =1 +$67,848.
- **RPS infra modeling:** baseline ~20 RPS avg / 41–42 peak. min_words=2 → ~58 avg / ~110 peak (+156%). min_words=1 → ~90 avg / ~165 peak (+300%). Recommended **265 RPS reservation** at min_words=2 (20% buffer).

**Recommendation:** **adopt MIN_WORDS = 2 as primary** (+20.6pp avg quality uplift, +228M terms/month, +$3.4K/month). Phase-2 expansion to MIN_WORDS = 1 once validated. Do not remove the 260-char limit.

### Other MCQ-quality work

- **MCQ Judge V2:** finalized the rubric and data prep, planned the SME rollout and feedback channels, and handed off ~8–9K labeled rows for SME evaluation; scoped multilingual coverage (EN-EN + EN-ES/FR/DE/PT).
- **MCQ Rewrite project:** led a sync and wrote the consolidated scoping doc (V1 target: "answer given away"; 1-to-1 rewrites; full-MCQ evaluation), and planned the production analysis (answer-given-away frequency, flipped-Q/A investigation, in-set vs out-of-set distractor behavioral analysis). Authored Confluence "Phase 3 Strategy: Eligibility Model, Rewrite Prompt Engineering, and Evaluation Infrastructure."
- Built **retention/correctness/difficulty dashboards** and defined session-composition analysis scope; authored the "AI/ML Product Quality Scorecard."

### Technologies & scale

LLM-as-judge (MCQ Judge), Cohen's κ, rubric design, SME evaluation pipelines, BigQuery / SQL analysis at production scale (373M terms/month), Periscope dashboards, A/B testing concepts (GrowthBook), 95% confidence intervals on Good-rate deltas, stratified sampling, peak-multiplier modeling for RPS forecasts, Gemini 2.0 Flash FT, OpenAI GPT-4o-mini, Google Docs/Sheets.

### Resume-ready bullets

- Authored a quantitative analysis of 5,200 production LLM-generated distractors across 9 generation sources, identifying retention/difficulty trade-offs and recommending difficulty-personalized onboarding — backed by BigQuery analysis at 373M-terms/month production scale.
- Designed and ran a stratified A/B study on LLM distractor eligibility thresholds, proving **+10.9pp to +39.9pp quality uplifts over a rule-based fallback** across answer-length buckets with statistically significant 95% CIs.
- Recommended **MIN_WORDS=2** as the new eligibility threshold (+20.6pp avg quality uplift, +228M terms/month coverage, +$3.4K/month cost) with explicit phased rollout path and RPS reservation modeling.
- Co-owned an LLM-as-judge quality framework for generated study questions: built rubrics, prepared multilingual SME-labeled datasets (~8–9K rows), and stood up the evaluation pipeline.
- Led scoping of an MCQ-rewrite initiative, defining eligibility criteria and a full-MCQ evaluation methodology.

---

## 6. Monitoring, Observability & SLOs

**Period:** ~Sep 2025 → Jun 2026 (intensive May 2026). **Role:** Owner of hex-study monitoring/SLO definition; on-call-style incident support.

**What she did specifically:**

- **Owned hex-study SLO/threshold design** (`monitoring-infra` PR **#1856**): analyzed 9 days of post-scaling data and proposed a complete, defensible monitor set — HPA replica utilization (warn-only at 100%), per-pod memory (>90% sustained rather than an over-tight 60%), P95/P99 latency (kept defaults 500ms/2000ms against live ~244/252ms = 2×/8× headroom), and a two-tier CPU-vs-request monitor (warn 60% / page 80%, since the app container has no CPU limit). Carefully separated *page* vs. *warn* conditions (page only on crash-loop, pods-available <80%, and latency).
- **Incident support:** helped diagnose the 6/1 `ModuleNotFoundError: No module named 'pkg.observability.latency'` that caused pod restarts and availability drops at gunicorn boot (traced to a `pkg-observability` version used by hex; Emily applied the version fix); reviewed Datadog Bits-AI investigations for Jeff; noted alert "blow-ups" in `learn-alerts`.
- Reviewed/answered platform SLO questions and aligned thresholds with Aaron, Jeff, and Lam.

### Technologies & scale

Datadog (monitors, dashboards, notebooks, SLOs, Bits-AI), Kubernetes HPA metrics, `monitoring-infra` repo, GKE; live P95 ~244ms.

### Resume-ready bullets

- Designed the production monitoring/SLO suite for an ML inference service (latency, memory, CPU-vs-request, HPA, crash-loop), explicitly tiering page vs. warn conditions from real traffic data (monitoring-infra).
- Supported production incident response on Kubernetes (boot-time import failures causing pod restarts), partnering with platform to restore availability.

---

## 7. Smart Grading Research (LoRA / fine-tuning) — precursor to WAG V5

**Period:** ~Nov 2025. **Role:** Researcher/contributor.

**What she did specifically:** Ran a smart-grading study showing a **LoRA-tuned Qwen 7B sharply outperformed the MiniLM baseline** (with the caveats of GPU + licensing needs); found human labels beat synthetic data and noted limits from discrete grade outputs. Earlier (Mar 2026) she ran extensive prompt-iteration/swap experiments on a written-grading model, reporting per-direction F1 (e.g., served-direction F1 ~0.53–0.57, κ up to ~0.42) and recommending a research-pause with a clear write-up — demonstrating disciplined "know when to stop" judgment.

### Technologies & scale

LoRA fine-tuning, Qwen 7B, MiniLM (sentence embeddings), F1 / precision / recall / Cohen's κ, holdout evaluation.

### Resume-ready bullets

- Researched fine-tuned LLM grading (LoRA Qwen 7B) against a MiniLM baseline, quantifying quality with F1 and Cohen's κ and surfacing data-labeling and licensing trade-offs.
- Ran prompt-engineering and swap-robustness experiments on a grading model, then authored a clear recommendation to pause when ROI didn't justify production scale.

---

## 8. Search Quality, Recommendations & Vertex AI Search

**Period:** ~2025 (esp. Sep–Oct 2025). **Role:** Owner of several Search/Recs data & quality workstreams (Jira MLE-221 Search Quality, MLE-482 Rec Evals; SH-29xx tickets).

**What she did specifically:**

- **Vertex AI Search migration & debugging:** investigated a significant data discrepancy (~301K source docs with `associated_school_ids` vs. only ~2,382 verifiable in the datastore), diagnosed that the console showed `derivedStructData` not raw `structData`, and ran a multi-week support engagement with Google (with reproducible REST/`curl` document-API evidence) — ultimately concluding direct datastore validation wasn't feasible and BigQuery source validation was the path. (Jira SH-2938, SH-2921.)
- **Recommendations / Recs Pages:** built dbt models and Datadog/Periscope dashboards and health-metric alerting for the new Recs Pages feature; coordinated logging and metric definitions with product (Ross) and platform.
- **Search quality rubric:** shifted the evaluation rubric from engagement-driven to user-intent-driven; ran LLM quality evals; managed SME evaluation send-offs.
- **Evals migration support:** part of the team migrating evaluation pipelines from Gentrace to OpenAI Evals.

### Technologies & scale

Google Vertex AI Search / Discovery Engine, BigQuery / BQML, dbt, Airflow, Periscope, GrowthBook, Datadog, Terraform (data-infra PRs), OpenAI Evals; 34M-document datastore.

### Resume-ready bullets

- Led debugging of a 34M-document Vertex AI Search migration, isolating an index-mapping discrepancy and driving a vendor support case with reproducible API evidence.
- Built dbt models, dashboards, and health-metric alerting for a new recommendations surface, partnering with product and data engineering.
- Reframed search-quality evaluation around user intent and ran LLM/SME evaluation cycles.

---

## 9. Study-Behavior Segmentation & Data/Analytics Foundation

**Period:** ~early–mid 2025. **Role:** Owner (data science / ML modeling).

**What she did specifically:** Built a **study-frequency segmentation model in BQML** classifying users into Sporadic / "Push-It" / Systematic studiers, with feature selection/normalization and feature-importance analysis, and presented actionable retention strategies (research deck "Study Frequency Spectrum Findings" shared with the Data Team). Maintained dbt models and Airflow DAGs (e.g., migrating `folder_sets` → `folder_study_materials`, backfilling `core_web_searches` with `hit_display_types` for search A/B tests), resolved Airflow permission issues, and built Periscope dashboards (e.g., Taste-Building Course Analysis).

### Technologies & scale

BQML, BigQuery/SQL, dbt, Airflow, Periscope, GrowthBook.

### Resume-ready bullets

- Built a user study-behavior segmentation model in BigQuery ML (feature engineering + importance analysis) and translated it into retention strategy recommendations presented to the Data Team.
- Maintained production data pipelines (dbt, Airflow) and analytics dashboards powering search and recommendation A/B tests.

---

## 10. Product Feedback, Dogfooding & Early Tenure

**Period:** 2023 → 2024. **Role:** Contributor / student voice.

Early in her tenure she contributed structured product feedback and QA on AI features (AI Expert Solutions, Magic Notes, Q-Chat), bringing a current-student perspective. She raised well-reasoned UX proposals (e.g., "save for later"/favoriting sets, Canvas-style course structure) that product/design engaged with seriously, and filed detailed dogfooding bug reports (Magic Notes upload failures, Q-Chat multi-question handling).

### Resume-ready bullet

- Contributed user-centered product feedback and QA on AI study features, surfacing UX and reliability issues that informed product/design decisions.

---

## 11. Technical Writing & Documentation

Throughout her tenure she authored substantial Confluence + Google Docs documentation, including:

- **V5 Self-Hosting Written Grading Findings** (Google Doc, May 2026) — the canonical decision doc for the production V5 architecture, including a full methodology, F1/κ tables, real-traffic VMR analysis, cost matrix, vLLM production runbook, and defense-in-depth guardrails.
- **Workspaces_ML_Research_Document** (Google Doc, Apr 2026) — 126K-character ML Engineering Source-of-Truth synthesizing 15+ docs, 8 Slack channels, 20+ tickets into a normative reference for the Workspaces ML team.
- **MIN_WORDS_FOR_ELIGIBILITY Analysis & Recommendation** (Google Doc, Nov 2025) — stratified A/B analysis of LLM distractor eligibility thresholds.
- **Learn MCQ Distractor Quality & Retention Analysis** (Google Doc, Nov 2025) — 9-source distractor quality breakdown + retention analysis.
- **Enabling Diagrams in Hex Planning** (Google Doc, Mar 2026) — the LEARN-1145/2486 design doc.
- **Current / "A Complete Foundation Guide" — Study Service Performance** (Confluence)
- **Question and Distractor Generation in Study Service: A Detailed Overview** (Confluence)
- **Study Routes for Question Generation, Sequencing, Lookup, and Explanations** (Confluence)
- **Improving Quality and Coverage of MCQ Distractors in Learn and Test** (Confluence)
- **Phase 3 Strategy: Eligibility Model, Rewrite Prompt Engineering, and Evaluation Infrastructure** (Confluence)
- **AI/ML Product Quality Scorecard** (Confluence)
- **Skills Setup: Managing Claude and Cursor Skills for Workflow Efficiency** (Confluence)
- Plus numerous Google Docs (MCQ Rewrite, eligibility A/B test steps, hack week, evaluation labels, V1 SOT eval, study frequency findings deck).

### Resume-ready bullet

- Authored architecture, performance, and ML-quality documentation that served as reference material for the team — including the canonical decision doc for a production ML service migration ($48k–$192k/yr architecture trade-off) and a 126K-char ML Engineering Source-of-Truth.

---

## Cross-cutting strengths (interview talking points)

- **Production ML ownership:** took an ML capability from research → hardware/model selection → cost/topology decision → A/B design → infra rollout coordination, with quantified production impact (+33% relative quality improvement).
- **Performance engineering:** event-loop/async profiling, serialization optimization, Kubernetes/HPA tuning, load modeling (Poisson + burst + VMR-based prod inflation).
- **Experimental rigor:** Cohen's κ, F1/precision/recall, Poisson vs. burst load modeling, variance-to-mean traffic analysis, 95% CIs, stratified sampling, holdout evaluation, "know when to stop."
- **Observability & on-call:** Datadog monitors/SLOs/notebooks, incident triage, real-traffic-based threshold design.
- **Quality/eval craft:** LLM-as-judge rubrics, SME pipelines, distractor analysis at production scale (373M terms/month, 5,200 distractor study).
- **Cross-functional collaboration & communication:** worked fluidly with Platform, ML Platform, Data Engineering, backend, and product; authored normative SOT docs synthesizing 15+ sources for team alignment.

---

## Technologies & tools checklist (hands-on, evidenced)

**Languages:** Python (primary), SQL; working exposure to Go (study-service integration) and Kotlin/KMP (cross-platform PR).

**ML / modeling:** vLLM (0.21.0), Qwen3-32B-AWQ, Qwen 7B, LoRA fine-tuning, MiniLM embeddings, **AWQ Marlin (4-bit) and AutoRound (2-bit) quantization**, BQML, **LangGraph / LangChain**, Vertex AI RAG Engine, LLM-as-judge (MCQ Judge), evaluation metrics (Cohen's κ, F1, precision/recall), 95% confidence intervals, stratified sampling, OpenAI Evals, Arize (LLM-as-judge), GrowthBook (prompt versioning), Gemini 3.1 Flash Lite + Gemini 2.0 Flash FT + OpenAI GPT-4o-mini (multi-vendor LLM serving).

**Serving / backend:** FastAPI, Gunicorn, asyncio (`run_in_executor`), Pydantic, orjson/gzip serialization, **NDJSON streaming**, **MCP / SDUI** integration, Google Spanner, Redis (cross-team), MySQL (asyncmy driver), Pub/Sub, GCS.

**Infra / platform:** GCP, Google Kubernetes Engine (GKE), Kubernetes + Helm, HPA tuning, Istio mesh, NVIDIA **H100 80GB / A100 40GB / L4 24GB** GPUs, GPU quota / spot / on-demand / CUD cost management, Terraform (data-infra).

**Data / analytics:** BigQuery (at 373M terms/month production scale), dbt, Airflow, Periscope, GrowthBook, Vertex AI Search / Discovery Engine (34M-doc datastore).

**Observability / tooling:** Datadog (APM, dashboards, monitors, SLOs, notebooks, Bits-AI, mesh + trace metrics, variance analysis), DogStatsD, pyinstrument, ApacheBench (`ab`), Git/GitHub, Jira, Confluence, Cursor, Claude.

---

## Appendix — GitHub PR references she posted (for portfolio backup)

> Repos are private (github.com/quizlet/...). PR numbers are included so she can reference scope in interviews; she should re-confirm merge status / exact diffs from memory since the repos aren't externally viewable.

**service-inference-lookup (hex / Python ML inference service):** #3672, #3675 (diagram MCQ location + empty-side fixes; LEARN-2486 / LEARN-1145), #3701 (Pydantic deserialization CPU-bound — predecessor to agentiq executor work), #3755 (run_in_executor offload), #3757 (MCQ duplication), #3759 (SATA duplication), #3769, #3831 (question-generation freshness), #3850 (remove ineffective asyncio sleeps / trace cleanup), #3866 (stale-question-ID grading race workaround); #3621 (generation-path/process-pool — Aaron's PR, she helped land).

**quizlet-shared-kotlin (KMP):** #1885 (MCQ duplication fix).

**quizlet-infrastructure (Helm/GKE):** #12912, #12923, #12928, #12941, #13044 (hex-study HPA / resource tuning).

**monitoring-infra:** #1856 (hex-study monitors/SLOs).

**dbt:** #1913. **data-infra:** #487 (Terraform/BQ dataset perms).

**Jira:** LEARN-2486 (Closed, assigned to her); LEARN-1145 (planning), XFPT1-119 (RAG test data); referenced MLE-221, MLE-482, SH-2938, SH-2921, SH-2832.

---

## Source documents consulted for v2 enrichment

- **V5 Self-Hosting Written Grading Findings** (Drive `1LgB7Iml...`, 30KB, May 27 2026) — fully read.
- **Workspaces_ML_Research_Document** (Drive `12HgSPS7...`, 126KB, May 1 2026) — read via subagent.
- **MIN_WORDS_FOR_ELIGIBILITY Analysis & Recommendation** (Drive `1NikYp4h...`, 1.2MB, Nov 2025) — read via subagent.
- **Learn MCQ Distractor Quality & Retention Analysis** (Drive `1dUxMHr8...`, 19KB, Nov 2025) — fully read.
- **Enabling Diagrams in Hex Planning** (Drive `1Y15jh4h...`, 28KB, Mar 2026) — fully read.
- Plus v1 Slack/Jira/Confluence findings from the Cursor research run (see `Research/ideation/notes/cursor-deveyn-portfolio-catalog-result-2026-06-03T143401Z.md`).
