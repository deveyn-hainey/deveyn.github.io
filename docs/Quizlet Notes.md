# **Concise Full Tracking**

Career Development: Wins

SPRINT 11| May 29, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

What was accomplished: 

Written Grading: 

● Onboarded & reproduced V5 quality LEARN-2838: Reproduce WAG V5 eval ● Recovered missing data from Aaron’s GCS handoff; rebuilt queue.sqlite3 \+ Groq logprobs 

● κ=0.583 on 412-row test (matches published 0.585) 

● Fixed canonical LR head (d4\_rubric\_examples\_canonical\_v2.pkl); flagged 3 doc/artifact bugs to Aaron 

● Experiments: self-hosted latency 

![][image1]LEARN-2839: Self-host Qwen3-32B-AWQ and benchmark inference latency for V5 ● A100: p95=132ms, \~8 RPS max → misses 100ms target   
● H100: p95=36ms @ 30 RPS, 49ms @ 100 RPS → Path A viable 

● L4: p95 floor \~240ms → ruled out 

● Burst caveat: 30 simultaneous submits ≈340ms (steady-state fine) 

● Validated self-hosted quality 

● vLLM H100 κ=0.562 (Δ−0.02 vs Groq, within noise) 

● Cost framing  
● V4 anchor thought \~$46k/yr but actually $10-15k based on query→ H100 spot \~$192k 

● Docs & deliverables 

● V5 Self-Hosting Written Grading Findings \+ docs on branch 

Other: 

● SLOs for study service MLE-1012: SLOs with Platfrom 

○ Had a bunch of pods restarting and under availability because of this PR ● Distractor V9 analysis LEARN-2840: V9 distractor exploratory analysis ○ Looked into segmenting off of answer length and pulled data from both variants to see differing distractors and quality 

Learn v9 control and experiment questions 

■ Could be useful to add correctness rate here too 

■ https://app.periscopedata.com/app/quizlet/1289183/Deveyn-Learn-Scratc h 

SPRINT 10| May 22, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

What was accomplished: 

● Applied Gen AI Onsite 

● SLOs for hex-study 

● Question-gen consolidation PR reviews 

● SA3 Learn eval final iteration and findings 

Learn Question Quality (SA3 \+ Distractors V10 vs Production) 

● Study optimization full documentation: 

https://us5.datadoghq.com/notebook/284387/study-service-optimization-journey ● Ticket clean-up 

SPRINT 10| May 15, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

What was accomplished: 

Study Service: 

● LEARN-2656: Questions taking long time to load Fixed a cache freshness race in study/question-generation where async ML predictions (SATA, distractors, card-side recs, card parsing) could be ignored for up to 10 minutes post-cache-write. Now does a lightweight parallel timestamp check on every cache hit and synchronously regenerates if any prediction is newer, returning fresh questions immediately. Decreased % fallback questions served as a nice result. 

● SA3 Learn Eval: 

○ Started evaluation for manual vs SA3 

■ Pipeline building \+ manual data pulling, etc.  
■ Learn Question Quality (SA3 \+ Distractors V10 vs Production) 

■ Main takeaway: SA3 cards score 86.89% Good vs 85.62% for human cards (both using A4 distractors), a difference of only 1.27pp with 

substantially overlapping CIs… meaning SA3 is effectively at parity with 

human-authored cards on question quality. 

● Infra Scaling and changes: 

○ MLE-1001: Up hex-study pod count 

○ Still in discussion but current HPA:17, Max:300, Min:50, CPU:300m 

● SATA Duplication (LLM) 

○ LEARN-2454: SATA shows duplicated options finally closed this PR, was just a version issue. Once that was fixed, the fix could be seen in prod.   
Study Optimizations: 

● Clean-up: MLE-999: \[Clean up\] asyncio.sleep()s affecting trace visibility started PR Other: 

● LEARN-2745: Preserve previous question payload for grading lookups during rege… ○ This ticket was created because Sam initially thought that the freshness change I merged in was causing a race condition between generation and get-by-id, but it's actually a race condition between get-by-id and grading. 

■ We decided that they'll cache the current question in Redis on the Go side, so we don't need to do anything on our end. 

● PR reviews 

● Testing SDL 

SPRINT 9| May 8, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

What was accomplished: 

Study Optimization   
● Next sprint: update question generation to stop depending on set properties. Use studiables service for language, drop title and LastModifiedSeconds 

● Addressed comment with this PR and had really thoughtful conversations with Shane about this work and ultimately decided to drop process pool work for now due to complexity; PR available if needed: MLE-988: hex-study process pool 

○ Overall though, After the changes we tried this week, event loop blocking dropped from \>5% to \<5%; p95 is in good shape; p99 tail is likely CPU-bound, diminishing returns on further tuning so this gave us really good signal to conclude this optimizations. 

● Reverted CPU to 300m MLE-993: Lower HPA CPU target then lowered HPA targetCPUUtilization from 65 → 40\. More independent Python processes \= less fast-request blocking. 

● Tried upping CPU to 1 MLE-992: up hex-study cpu ; reverted, tripling request CPU divided reported utilization by \~3.3, causing HPA to scale down under the same real load Study Service  
● LEARN-2656: Questions taking long time to load Freshness check PR in progress to speed up SATA loading this carries into next sprint 

● LEARN-2676: Enable bolding for distractors PR created to enable rich text (bolding) in distractor fallback flow 

● LEARN-2617: Web | User doesn't get prompted to answer written question… Investigated written question prompting bug. **not prioritizing right now, present in both old and new flows** 

● LEARN-2454: SATA shows duplicated options Merged a fix (or so a I thought) but still seeing SATA duplicate options, **on radar but not prioritized**   
Other: 

● PR reviews 

● Setting up testing with GO (a pain in my butt) 

SPRINT 9| May 1, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

What was accomplished: 

Study Optimizations: 

● Created a plan for the processor pool work 

● This was the main focus this week. I started a PR here 

https://github.com/quizlet/service-inference-lookup/pull/3769 which when a cache miss comes in, question generation was running on the main event loop and holding the GIL, causing cache hits to queue behind it. The fix has two parts: move generation into a worker process so the main loop stays free, and pass the worker's output bytes directly to Spanner and the Go response without the parent rebuilding Pydantic objects on the loop. 

○ Did a lot of local verifying and benchmarking 

Study Service: 

● Addressed 

○ LEARN-2454: SATA shows duplicated options 

○ LEARN-2554: Fallback MCQ duplication 

○ Did local testing and verification to make sure everything worked 

● Also helped Annika with this ticket 

LEARN-2564: Old Set SATA questions are working for old and new learn, but newl… Workspaces: 

● Another pass at the ML engineering doc Workspaces\_ML\_Source\_of\_Truth.md (needed to be updated for more depth)   
Other: 

● Denver earth day volunteering 

● Help test out new Smart Assist models  
SPRINT 8| Apr 24, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Study Service: 

● Started work and investigation on these tickets: 

● Initially tried to use Ravi’s PR without fully understanding what the bugs were so I lost time on that..But took some time to dive into these tickets and diagnose them. ○ LEARN-2564: Old Set SATA questions are working for old and new learn, b… ○ LEARN-2454: SATA shows duplicated options | Comment 

○ LEARN-2554: Fallback MCQ duplication | Comment 

■ PR Study 

■ PR KMP 

● Updated ML distractor page 

Study Optimizations: 

● Merged moving the generators off the main loop last week, started an audit on what could be next steps going forward gist 

● Create a PR to Chunk Generators 

● Created a PR to Offload Build Groups 

○ Both PRs landed flat because 

Other: 

● On Campus User Research 

● Workspaces Doc consolidation work Workspaces\_ML\_Research\_Document copy 

SPRINT 8| Apr 17, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Study Service: 

MCQ Location \+ Sort Bug: LEARN-2486: Diagram MCQ location and sort bug ● Fixed silent drop of LOCATION \-\> WORD and LOCATION \-\> DEFINITION MCQs on three-sided diagram cards pulled location-prompt MCQs out of the answer-side precedence loop entirely and append them unconditionally after 

● Consolidated MCQ sort logic into HEX (away from Go service) by adding a direction-tier primary key to \_recommendation\_sort\_key, ensuring Go's first-ref deduplication picks the correct direction 

Study Optimizations: 

MLE-957: Remove \_spanner\_is\_enabled guard from question-generation cache fetch path MLE-959: Deduplicate Spanner question-cache read query between typed and raw fetch … MLE-971: Move CPU-bound Question Generators to run\_in\_executor   
● Removed legacy \_spanner\_is\_enabled feature flag and deduplicated Spanner cache read queries between typed and raw fetch paths follow-up: MLE-972 

● Moved CPU-bound question generation off the asyncio event loop via run\_in\_executor no measurable latency change observed; follow-up scoped under MLE-974 ● Latency crept back up after raw dict PR merge investigated with team, root cause still unclear (traffic increase vs. something else); Aaron has investigation notes Other:  
● Synced with Sam on expanding sort logic to other question types for diagram sets continuing next week (Sam OOO) 

● Reviewed Aaron's Smart Assist Eval doc here 

SPRINT 7| Apr 8, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

**Out Friday** 

Study Service: 

Sort question generation output by card side recs \- normal cards: 

MLE-904: Order generated questions by study side rec 

● Merged PR to sort each question type's list by cardSideRecommendationRank during question generation (FIRST\_CHOICE \-\> SECOND\_CHOICE \-\> NOT\_RECOMMENDED \-\> absent) 

● After merge, Sam flagged that cards also needed to appear in a certain order for the Go service 

○ Opened follow-up PR where sort\_questions\_by\_recommendation now sorts by (1) card-side recommendation rank and (2) studiableItemId within each rank tier \- fixed Sam's issue 

○ Edge case to note: card side recs don't work well with diagram sets or n-sided cards, something to keep in mind for future work 

Hex Study Optimization: MLE-874: Study Performance Optimizations 

● Opened PR to skip Pydantic model construction and serialization on the question-generation cache-hit path (raw dict \+ ORJSONResponse), mirroring the same optimization from \#3621 on question-sequence 

○ Profiled and validated with MD5 check to confirm data wasn't changed ○ Saw huge improvements \- drops on hex-study, question generation, question sequencing, fallback questions, study-bites, etc. 

○ Root cause clarity: PR \#3621 fixed question-sequence but question-generation was still running the old code at 4× the traffic, continuously polluting the shared event loop — fixing both finally cleared the blockage 

● Ticketed all cleanup and code quality follow-ups under MLE-874   
● Cleanup PRs open for question-sequence and question-generation; one more in flight for spanner is\_enabled removal \+ SQL query deduplication 

○ PR \[Study Service\] clean up old pydantic flow on question-sequence 

○ PR \[Study Service\] clean up dead code for question-generation 

○ Still have another one in flight for \_spanner\_is\_enabled removal \+ SQL query deduplication on the question-generation. 

Other:   
● Platform team changed the staging inference-lookup domain without notifying us \- updated local domain config and opened a PR 

● Completed DX survey   
● Handed off Hack Week segmentation work to Kara  
SPRINT 7| Apr 1, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Study Service: 

Study Optimizations 

● I fixed, and merged in aarons PR 3/31 

○ Saw latency slightly decrease on the question-sequence endpoint here ○ Didn’t really see the effect on the study-bites endpoint though here 

● Starting to look into a fix with something else \- tbd 

Card Side Recs: 

● Aaron has a pr open. I took a look and it looks like it will be good. I just asked some clarifying questions about it. Hopefully we can get it merged once the questions are addressed. 

○ MLE-904: Order generated questions by study side rec 

Supporting Images: 

● LEARN-2352: MCQ option with only image is blank 

○ Started a fix on this on 4/1 need a review PR 

● LEARN-2379: Don't show sets with images in ISBs, but keep for Study CTA \- study bites 

● LEARN-30: Missing images on MCQ distractors \- should be tied to 2352 i believe 

Diagrams: 

● Initially thought i had everything done but i did not account from some study directions needed and if a term or definition was empty. Created two prs to fix this. 

SPRINT 6| Mar 27, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Rewrite analysis LEARN-2246: Learn Rewrite : 

● Data For Rewrite Eligibility Added 300 holdout for evals. 

○ Ran eligibility model evals across 5 prompt versions (v1–v3no) on 300-card training set, 102-card holdout, and 300-card holdout. On the 300-card holdout, v2 and v3no are the best bets for served quality (F1 \~0.57, v3no best recall/FN count); v3ex is still the best for card-level and D2 holdout metrics and for training-set served metrics 

○ Evaluated card-level, per-direction (D1/D2), and served-direction metrics; v3ex emerged as best on precision/F1, v3no as best on served recall (0.968, 1 FN) ( ○ Ran swap-invariance tests across all prompt versions; found v2/v3no most stable, few-shot prompts (v1, v3ex) most order-sensitive  
○ Documented key precision ceiling (\~40–47% on holdout) driven by term+def-only constraint and "distractors save it" cards 

○ Compiled full findings doc with prompt recommendations and next steps (FP error analysis, pre-filters, D1 data expansion) 

○ Rewrite LLM Eval 

Study Tickets: 

Was assigned multiple tickets: 

Priority 1: 

\- Don’t just do the tickets, document the whole flow to understand performance at each step/endpoint 

~~MLE-874: Study Performance Optimizations~~ 

\- 3 ish tickets here i think 

Priority 2: 

\- Look into images \-\> quality tradeoff before starting to understand what including images will do 

~~DH \- LEARN-2352: MCQ option with only image is blank~~ 

\- LEARN-30: Missing images on MCQ distractors (overlap or dupe) SM/DH \- LEARN-2379: Don't show sets with images in ISBs, but keep for Study CTA 

Done: 

~~DH \- LEARN-1642: Distractors referencing MCQ tags (e.g. "Both A and B") should …~~ \- Tingting worked on \- has pr merged 

~~DH \- LEARN-2263: Handle special character input~~ 

\- Closed 

I was able to put them in order of priority moving forwards for work now the eligibility is on hold. Study Performance Optimizations: 

Started looking into MLE-902: Up CPU and worker count for hex study service ● Asked emily about from MLP perspective need to ask further clarification question before asking wider group. 

● Started looking into the code as well. What i want to do is document the full flow/performance at each step before executing on tickets \- understanding the system end-to-end will make fixes more principled slim starting that and will continue. Other: 

● Merged in the final PR for the MCQ diagram work 

● Reviewed Ridwans study migration PRs 

● Meetings  
SPRINT 6| Mar 20, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Rewrite analysis LEARN-2246: Learn Rewrite : 

● Pulled and labeled \~300 production cards across targeted buckets (general, verbatim, root-word). Data For Rewrite Eligibility 

● Defined a structured evaluation framework across question direction, prompt, and distractor impact. 

● Identified nuanced “answer giveaway” patterns and created category bins to separate true issues from distractor/design effects. 

● Established a realistic prod baseline (\~2–4.5%) for rewrite eligibility to guide scope. ● Prepared groundwork for LLM-based labeling by clarifying what constitutes a rewrite-worthy case. 

Diagram support in Hex/Learn: LEARN-2336: Support location as a card side in HEX Enabling Diagrams in Hex Planning 

● Implemented LOCATION as a first-class card side across flashcards and written generators. 

● Added safeguards to prevent invalid MCQs where LOCATION distractors are unsupported. 

● Built fallback MCQ generation using in-set diagram pins (WORD/DEF → LOCATION). ● Ensured full data flow of diagram pins through preprocessing and generation pipelines. ● Validated via unit tests, regression coverage, and real set QA. 

Language feature audit (kickoff): LEARN-2378: International / Non-English Learn Quality ● Defined scope of audit across key ML features (MCQ, smart grading, ranker, LLM systems). 

● Outlined language tiers (English baseline, top non-English, long-tail fallback). ● Identified key metrics for comparison (correctness, engagement, subs, demographics). Experiment \+ infra cleanup: 

● Cleaned up and finalized v8/v9 A/B test experiments. 

● Completed Hex rollout cleanup and stabilization work. 

● Performed Quizlet web and infra cleanup to reduce technical debt. 

● Supported additional PR reviews, planning, and cross-team coordination. 

SPRINT 5| Mar 13, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Notes: 

Rewrite: 

● This week mainly focused on creating a dashboard to understand what types of questions need to be targeted for rewrite. 

● MCQ Rewrite Doc Initial Thoughts  
● Found: **V1 Target:** 1.4% of MCQs give away the answer verbatim. User created content has 2.1x higher leakage than AI assisted/generated (1.76% vs 0.83%). **Why this matters:** 74% of Learn sessions are non-creators studying someone else's content, quality issues hit them hardest. User-created sets \= 92% of Learn sessions. ○ **Other quality *issues/things* found (V2+ scope):** 

● SATA/multi-part lists: 5.6% of sata eligibles cards shown as mcqs. 

● Flipped Q/A: \~1-2% of evaluable questions looked like they could be 

flipped. 

● LLM out-of-set distractors: 4.2pp correctness gap for non-creators vs in-set 

● My plan for next steps is to look at some gemini models for an eligibility model to identify cards where the answer appears on both sides (prompt \+ answer) 

Started V8 and V9 a/b test clean up: 

● Removed all v8/v9 distractor A/B test logic across hex, quizlet-web, and infra after both experiments concluded with control winning eliminating GrowthBook routing, rollout constants, model version branching, and experiment-specific tests. 

● Cleaned up deployment and infra artifacts, including deleting v8/v9 service configs, ArgoCD applications, image updater sources, and related YAML entries, restoring the default distractor model range (2.60.0–8.0.0) for all users. 

● Pure code and infra cleanup with no intended behavior change; PRs are currently under review, and I’ll monitor v7 distractor APM and remove remaining experimental branches after merge. 

○ THIS STILL NEEDS TO BE MERGED AND APPROVED BY MLP.   
Enable SATA Questions: 

● Monitoring latency of the question generation endpoint here and the ISB endpoint here ● Re-enabled SATA end-to-end in the question generation pipeline for M2, restoring InferenceType.SELECT\_ALL\_THAT\_APPLY in ENABLED\_INFERENCE\_TYPES (to fetch SATA predictions from HEX) and re-activating 

QuestionType.SELECT\_ALL\_THAT\_APPLY via generate\_sata\_questions in the QUESTION\_GENERATORS registry. 

● Aligned implementation and tests with the shared generator contract, adding the missing api\_version parameter to generate\_sata\_questions and updating tests to reflect SATA being enabled for both inference retrieval and question generation. 

Look in including Diagrams: 

● Started conversations on the work regarding this. 

● What we know so far: 

○ The location card side (StudiableCardSideLabel.LOCATION) already exists in the Hex data models 

○ The studiables service already includes the location card side in its responses for diagram sets (confirmed by Ian) 

○ MediaDiagramShape is already parsed at the dispatch layer- Hex receives and understands diagram data today  
○ The entire gap is in the question generators, which hard-code (WORD, DEFINITION) and (DEFINITION, WORD) as the only side pairs 

○ Every affected generator file already has a \# TICKET: LEARN-1145 comment marking exactly where diagram support needs to be added 

○ mcq\_generator.py already includes LOCATION in ALL\_ANSWER\_SIDES \- the MCQ orchestration layer is ready, the sub-generators aren't 

○ Files that need changes: flashcard\_generator.py, written\_generator.py, mcq\_fallback\_generator.py, mcq\_custom\_distractor\_generator.py, and 

get\_other\_textual\_card\_side\_label in dispatch/data/studiables/models.py ● If Shane doesn't answer on the async path:   
○ Don't wait on it. The async question is about future-proofing, not about unblocking the current work. The existing sync question generation endpoint is what needs to change per Shane's own confirmation ("it'd just be a change to the existing endpoint's response"). You can make all the generator changes now, and the async path can be addressed as a follow-up once Shane clarifies whether the pubsub payload already carries full card side data or not. It's a separate concern. 

SPRINT 5| Mar 6, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Notes: 

LEARN ONSITE: 

● Connecting with the team 

● Study Alongs 

● Brainstorming 

● Connecting on mcq Rewrite. Feedback for things to consider: 

○ terms that can be question-ifide \- should these be considered? 

○ questions that give answer away \- should be qualified for rewrite 

○ questions with bad distractors \- should these be considered? 

○ Creator vs no creator segmentation \- will this change how user judge the quality of LLM generated content? 

○ look at reach if we want 

○ too early to think about opt-in for UX 

○ look at enterpret feedback too 

○ teacher created vs not 

● Learn / Core Study Onsite Q1 2026 

SPRINT 4| Feb 27, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Notes: 

DATA CONFERENCE: 

● Presentations 

● Feb 2026 Quizlet AI and Data Offsite  
SPRINT 4| Feb 20, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Notes: 

● Short Week. Holiday on Monday 

Rewrite: 

● Started the initial planning on the rewrite. 

● Did a manual eval \- without considering a FULL rewrite. With this, it lead to more discussion about how we should move forward. 

○ Created a v1 research plan to be on the same page MCQ Rewrite ○ Started Phase 1 and Phase 2 of the research plan   
MCQ Scorecard: 

● Created a Learn score card to track all the things we are doing in learn. ● COPY AI/ML Learn Product Quality Scorecard Updated 

○ Will have to regularly update this and align with Jeff on anything we feel needs to be easier to highlight for execs. 

Learn Presentation: 

● With the data conference next week, I will have to present something for learn. ● Started the outline here: Learn presenation draft 

● May do a formal presentation OR do a kahoot TBD 

Other: 

● Sprint documentation Generative AI and Study Team Q1 Planning Applied AI ● Read shane’s arc doc: Quizlet Generative AI Architecture 

● Set up epic for rewrite: LEARN-2246: Learn Rewrite 

SPRINT 3| Feb 13, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Notes: 

● Short Week. Holiday on Monday 

Learn Eligibility: 

● Need to update Page: ML Project Page \- MCQ Distractors Service when we get the a/b test done and if we decide to roll out.   
● Launched the eligibility experiment, ran into some bumps so had to fix that. We needed to remove a character limit and update the version to see the results. 

○ Monitoring 

● Start talking and learning about the MCQ rewrite work 

● Need to look at Shane's doc: Quizlet Agentic Architecture 

Reviews: 

● Started writing reviews, for myself, peers, and manager 

**LLM Eligibility Expansion \- v9 Changes Summary**   
**Changes Implemented:**  
● Removed minimum character limit: Changed min\_key\_chars from 3 → 1, allowing 1-character answers like "B", "5", "X" to pass general eligibility 

● Removed word minimum for English: Eliminated the 5-word requirement for English (en-en) terms in LLM eligibility checks 

● Non-English preserved: Non-English languages still require 5+ words (or numbers) for LLM generation to maintain quality 

● Version bump: Set to 9.0.0 for v9 A/B test deployment 

**Impact on en-en Distractors:** 

● Before: Only terms with 5+ words or numbers got LLM generation 

● After: ALL 1+ character English terms get LLM generation (excluding MCQs, terms with newlines, keys \>260 chars, wrong side recommendations) 

● Coverage: Expands LLM usage to 100% of eligible en-en distractors 

**Version Isolation:** 

● v9 only serves en-en sets through GrowthBook routing logic 

● v7 (control) and v8 (separate experiment) are unaffected 

● Only users enrolled in v9 experiment receive these changes 

**Important Note:**   
If this were launched without the v9 routing logic: 

● ⚠️ min\_key\_chars=1 would affect ALL languages (language-agnostic general eligibility filter) 

● ✅ MIN\_WORDS removal would still only affect English (language-specific check in LLM generator: if term\_features\["word\_language"\] \== "en") 

Good learning to dos: 

● How to better use Cluade Code 

Article:https://boristane.com/blog/how-i-use-claude-code/?utm\_source=tldrnewsletter 

SPRINT 3| Feb 4, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Notes: 

● Short Week. OOO Feb 5 \- 10 

Learn Min Eligibility: 

● Tested Web changes on gitpods 

○ Was a little bit of a pain because of how finicky they are. Needed to do this to test the routing logic for the v8 vs v9 tests were working correctly. 

○ Page: V9 AB Test Routing Verification 

○ Also made sure all unit tests worked correctly for inference Prs. 

○ Updated growthbook features flags to align with what we needed. 

■ Set to serve 0% 

○ Started merging in some PRs ran into and Argocd issue (slack) 

■ Trying to figure that out now. 

○ Updated rollout pr to also check the v8 v9 rollout 

Folders Logging:  
● Continued with logging, Specifically Native. 

○ Set up confluence page and starting checking events 

○ Page: Folders Documentation of Logging 

○ Folders logging 

Other:   
● Get peer reviews nominated 

SPRINT 2| Jan 28, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Notes: 

Hackweek Stuff: 

● Initially started work on communities Hack week stuff 

○ Which then changed to look for influencers/learners 

● Copy of Hackweek User Segmentation.ipynb 

● Hack week read out and demos slides H1 2026 Hackathon Demos Learn Remediation:   
● Added the eval scripts to ds-research 

● Had an issue with timeouts alerting \- investigating if we would like to filter out timeouts from our alert. TBD on this 

● Growthbook experiment 

Learn Min Eligibility: LEARN-2178: Remove Min Eligibility for EN LLM Distractor Generation ● I started working for this. Here’s my outline of steps Eligibility AB test Steps ○ I created:   
■ The feature branch → experimental branch (PR here) in hex   
■ Created staging infra PR with: (PR here)   
■ Created the Experiment in GrowthBook (Here)   
● Created and Linked a Feature Flag (Feature Here)   
■ Created the quizlet-weba/b test PR (PR here)   
■ Create production infra PR with: (PR Here)   
■ I need to also create the rollout logic pr as well.   
○ Once this is done I need to make sure everything is right, and then approved. Aaron has been sick so I haven't been able to talk to him about it. 

○ But this week was hopefully the bulk of the set-up work\!   
DS Stuff:   
● Continued working on folder documentation   
○ Got the first sheet slide done (so web) 

○ Page: Folders Documentation of Logging 

○ Folders logging 

SPRINT 2| Jan 21, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Notes:  
Short Week\!\! 

● Learn Remediation: 

○ Rolling out a/b test yay\!\! 

■ Does this mean we wait on any new additions till the test is done? 

● Caching tbd 

● Rate-Limiting tbd 

● Different Model 

● More iteration changes ?? 

■ Need to define SLAS and monitors with Aaron 

● Basically we want to not timeout above 10 seconds 

● Not have errors above 5% within 5 minutes spans 

■ Runbook and Project Outline 

■ Learn explanation documentation 

● Hackathon: 

○ Focusing user segments on “good studiers” 

■ Brainstormed Behavioral dimensions: 

● List 

● DS work: 

○ Started folder documentation for logging 

○ Dbt cloud set-up 

Things to Sync On: 

● Eligibility work. What needs to be done here? 

○ Ask Alyssa about running two possibly at the same time. 

○ Should be able to start this work soon. 

SPRINT 1| Jan 14, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Notes: 

● Learn Remediation: 

○ Evaluations\!\! 

■ Created a comprehensive dataset for all question types we would be evaluating. 

● Incorrect answer: MCQ, SATA, Written 

● Term and Definitions 

■ Created a few evaluation scripts. Initially the concurrency was set too low so the evaluations took a long time. Was able to iterate with Aaron and 

create a script that allowed for samples for faster iteration on prompts. 

○ Looked into changing the model from 4o mini to 5 mini for generation. This was a bigger headache than expected so more thought out work and time needs to be spent if we want to update the model. (A lot of generation failure and timeouts) ○ Ran a bunch of evals and had a prompt win out Learn Explanation Eval Data  
■ Updated prompt and error handling. We needed to update error handling for what the LLM deemed as content it could not generate content for. 

(gibberish/nonsensical info a user has on their card or types in for an 

answer) https://github.com/quizlet/service-inference-lookup/pull/3444 

○ Created a PR for more input validation relating to SOT doc and AIP contract. \[Remediation\] ML Source Of Truth Learn Explanations \- Technical Design ■ https://github.com/quizlet/service-inference-lookup/pull/3448   
○ QA’ed with the team. 

○ Looked into add more datadog charts for better visualization. 

● Found that we weren’t logging user selections for select-all-that-apply questions. Paired with Alyssa to get this updated. 

Hackathon: 

● Joined the user segmentation hackathon project. 

● Had an initial sync. 

○ Decided we will be doing user segmentation on “good studiers” (something that generalizes engaged learners. 

■ We will be brainstorming next week on the behavioral dimensions we want. 

■ Our final deliverable will be a way to score people on our segments plus a nice presentation about them\!.. once we have them. Most needed 

expertise is ML/DS together with Product/User Research/Marketing 

DS Work: 

● Folder data documentation 

Other: 

● Bigquery MCP server set up. 

● Align on Q1 work. 

SPRINT 1| Jan 7, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Notes: 

Learn Remediation: 

● Get an SOT doc finalized with everything we would like to have for v1. This includes how we want the service to work, what data we have to work with, what we want it to return, what’s being logged, moderation, quality rubric, and things that we are not doing for this launch, which are rate limiting, caching, and some output (html) validation. 

○ Will be having a team meeting on Thursday to finalize the doc. Once this is done we can work on improving the quality of the results. 

○ \[Remediation\] ML Source Of Truth 

● Created a branch with the way we can use the SOT as a rubric for quality. ○ Play around with prompts to see what yields good output.  
● Added moderation so the explanation will not be generated if a moderation flag is hit ![][image2]● Added additional logging to the hex bigquery table. That way we can now also have explanation\_id and answer\_options when they apply. See the SOT doc for more info. ○ Link to terraform to apply logging changes 

● Talked to Aaron about SLO and alerting decided we will figure this out next week. Other: 

● Added final sprint summary to XFPT1-76: Learn Quality Improvements ○ Decided that Vivian will create a new epic for ML sequencing.   
○ All other learn work that builds on XFPT1-76 will be continued in these epics: ○ MLE-630: MCQ quality improvement 

○ MLE-638: Learn Grading Quality 

○ MLE-691: AI Sequencing & Remediation 

● Added Search Eval Documentation done last year 

○ Page: Search Evaluation Documentation 

○ Page: Search Quality Roadmap 

● Added eligibility notebook to ds-research 

● Good doc for understand eligibility research for distractors 

Page: Lowering Word Count Threshold for LLM-Generated MCQ Distractors: 2025… ● Try to watch the first go training this week: 

Beginner's Go Training \- 2026/01/08 10:55 PST \- Notes by Gemini 

Dec 23, 2025 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James  
Notes: SHORT WEEK 

Learn Remediation: 

● Created a Source of Truth document. This clearly defines the functionality of learn explanations and the guidelines we are trying to cover. This document was created so everyone know what to expect from ML 

● Created a moderation PR. 

○ Adds input moderation to the learn-explanation endpoint using QModeration to filter profane or inappropriate content before LLM generation. 

■ Prevents inappropriate content from being processed by the LLM 

■ Follows the same pattern as practice\_tests and card\_suggestion services ■ Protects against profanity, OpenAI-flagged content, etc. 

○ Being reviewed 

● Updated the epic for Learn Quality Improvements 

● Updated Documentation on Distractor length phenomena 

● Started creating an evaluation system modeled off Ai Coach to continue in the new year. This should help us establish quality based on our source of truth doc. 

Dec 19, 2025 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Notes: 

Learn Remediation: 

● Get the HTML formatting, logging, and observability PR merged. 

○ Removed HTML validation and checks into a separate pr. Wasn’t really needed right now. 

○ Removed using gemini as a fallback because it was not configured to use very easily. 

● Added big query logging on the Hex side. 

○ Now we log created,set\_id,studiable\_item\_id,explanation\_type,question\_type, question\_instance\_id, question\_prompt, expected\_answers, user\_answers, term, definition, explanation, use\_html, llm\_provider, latency\_ms, success, error\_type, and error\_message. 

○ Had to create a infra PR and a Hex PR Also has to trigger the run to see the table created for production in Terraform. 

● QA the product. 

● Created a Datadog dashboard for some metrics. 

● Started on PRR for what we currently have. 

Page: \[WIP\] Learn Explanations \- ML Service Production Readiness Review ● Started on a Runbook for what we currently have. 

Page: Learn Explanations ML Service Runbook 

● Figured out we should be okay without load testing: Slack Thread 

● Had a Prompt Jam with Michelle. This had use create a few separate prompts to evaluate with an LLM judge. Testing prompt Sheet 

Recs Pages.  
● Updates made this week were: 

○ There was missing data in the recs\_pages table. The fact that there are a couple of records on those days told us it was most likely the case when the partition got overwritten openabecause the code is not protected for late arriving data. We had to update the incremental date filter on event\_timestamp as well as the \_PARTITIONDATE. 

○ I noticed the recs page table had bot traffic. We agreed it would be good to filter it out from the table. Needed to add an inner join to sessions.sessions table, and extend the time window so it updates the last 2 days (to align with how sessions table updates) 

**Moving Forward/Feedback:** 

● Start thinking about SLOs together. 

Dec 10, 2025 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Notes: 

Learn Remediation: 

● Figure out whether the LLM can reliably generate semantic HTML \<span\> tags with specific class names (e.g., correct-answer, incorrect-answer, important) 

LEARN-1796: Add HTML styling in LLM response 

Then update Hex’s learn-explanation endpoint to use those semantic tags in its responses. 

● Figure out next steps you should take to evolve your endpoint into something production-ready while keeping the contract stable 

Monitoring / Alerting 

Logging 

● Look at: GEPA Implementation Plan for Learn Mode Explanations 

● Defined arc: Learn Explanation Endpoint Broken Down 

● Next week things: 

Look at logging example 

Runbook 

PRR 

Load testing (?) 

Recs Pages: 

● Updated the dbt model to fully have the visit source included. 

○ I will need to update the dashboard. 

● Update the model to also account for late arriving data 

Learn Eligibility. 

● Update eligibility write-up based on new findings. 

● Finished research on the expansion of eligibility.  
○ Need to clean up the code and commit to ds research. 

● Update plan for implementing our findings into a/b tests. Specifically create steps I will follow. 

Other: 

● Update Jira tickets and summary for product ops people. 

Dec 5, 2025 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

system\_prompt \= """Generate exactly 2 sentences explaining incorrect answers: 1\. State the correct answer and explain why it's right 

2\. State the incorrect answer and explain why it's wrong 

Keep explanations clear, concise, and educational.""" 

 user\_prompt \= f"Question: {*request*.questionPrompt}\\nCorrect: {expected}\\nUser answered: {user\_answer}" 

Cross Cutting Concerns: 

**Prompt**: The thing the user is presented with that’s not the distractors. Below, the prompt is “the process by which green plants and some other organisms…….” 

When I get this wrong, it’s because I confused the definition of photosynthesis with either decomposition, chemosynthesis and combustion. If I get a definition confused with something, is it more useful to know why I was confused, or to reinforce the definition of photosynthesis?

![][image3]  
**Prompt**: which of the following statements is correct a ba cd ” 

If I get this wrong, I could not determine the falsehoods in 3 others. 

![][image4]  
Notes: 

Learn Remediation: 

● Learn Explanation Endpoint Notes 

● Created an endpoint for Learn remediation CE folks. PR 

○ This PR implements a new learn explanation endpoint in the Hex service that generates educational explanations for learning scenarios using LLMs. It is a minimal viable implementation to unblock some of our ce friends. SO right now we are explicitly choosing not to build out proper evals, runbooks, monitoring, logging, alerting, etc. In the next few weeks we will prepare links to research, runbooks  
and incorporate monitoring/alerting/etc....this is to unblock CE. **New Endpoint: /study/learn-explanation** 

○ Purpose: To be called by Study service to generate concise, educational explanations for: 

1\. Incorrect Answer Explanations \- Why user's answer is wrong and correct answer is right 

2\. Term Definition Explanations \- Educational context for terms and 

definitions 

○ Key Features: 

■ LLM integration (OpenAI GPT-4o-mini \+ Gemini 2.0 Flash) 

■ Concise 2-sentence structured responses (\~250-300 characters) 

■ Fallback system \- error code 

■ Supports question types: Multiple Choice, Written, Select All That Apply 

● Shared with CE team and they were able to get 200 responses for each explanation type and question type in staging/prod\! 

Learn: 

● ICB Dispatch connect Notes \- Emily / Deveyn Chat\! 

○ Connected on why this was failing and how-tos if we wanted to prioritize The team discussed issues related to **LLM question generation** for Study Bites, Learn, and future study modes. These systems use a **question generation endpoint** (in Hex / ML platform) that: 

1\. **Generates questions per type** (e.g., all MCQs for a set). 

2\. **Stores them in Spanner** (and caches in Redis). 

3\. **Feeds question IDs into a sequencing endpoint**, which determines the next N questions for a session. 

**The Problem** 

● The **first-time question generation is slow**, especially for large sets. ● Ting-Ting attempted to fix this by **pre-generating questions earlier** using a **new ICB dispatch process** (an async inference kick-off). 

● Her PR was reverted because: 

○ It generated **lots of logs and metrics**. 

○ This caused a **huge spike in pods** (scaling accidentally 

exploded). 

○ It brought instability to the inference system. 

**Current Impact** 

● Not a launch blocker because: 

○ Study Bites and Learn can still **fallback** to local question 

generation. 

○ But this fallback is **slow** for first-time users and not ideal for future 

Learn / CGBT usage. 

**Next Steps Agreed On** 

● Connect with Ian on what he needs this for and if it should be prioritized. ● Eligibility analysis expansion. Looking at changing both these filters currently in place: ○ MIN\_WORDS\_FOR\_ELIGIBILITY \= 5  
■ What it does: Requires the answer to have at least 5 words to qualify for LLM generation 

■ Filters FOR: Longer, more complex answers that benefit from 

AI-generated distractors 

■ Filters AGAINST: Short answers like "mitosis", "1776", "red" 

■ Exception: Numbers bypass this rule (even 1-word answers with numbers can qualify) 

○ MAX\_CHARACTERS\_ON\_SIDE \= 260 

■ What it does: Excludes terms where either the question OR answer 

exceeds 260 characters 

■ Filters AGAINST: Very long questions (essay prompts) or long answers (paragraphs, detailed explanations) 

■ Filters FOR: Concise content that works well in multiple choice format ○ Combined Effect 

■ For a term to be eligible for LLM distractors, it must pass BOTH filters: ● Answer ≥ 5 words (or contains numbers) AND 

● Both question AND answer ≤ 260 characters each AND 

● No newlines in the answer AND 

● Other criteria (language, recommended side, etc.) 

○ Key insight: These work as gates \- a term must pass ALL criteria to even attempt LLM generation. Even then, LLM distractors compete with other generators in the final ranking. 

○ This could explain why your 8-10% quality difference didn't translate to a huge increase in LLM usage \- many newly eligible terms might still fail other filters or lose in the ranking process. 

Search: 

● Update native dbt model to disclude shelf actions (introducing duplicates) ● Update recs pages dbt model to include visit source now that the test is live. PR ○ Iterate on this pr per some feedback\! 

Other: 

● Shaping Engineering KP feedback for people operations team 

● Pulse Survey 

● Help PMs with some search query self serve starter advice. 

Nov 25, 2025 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Notes: 

VERY SHORT WEEK (Mon/Tues) 

Learn:  
● I had a good discussion last week about expanding eligibility. Decided it would be best to do an analysis on eligibility thresholds so we have a *why* behind our *do*. (i.e a/b test expansion) 

○ Create this analysis: 

MIN\_WORDS\_FOR\_ELIGIBILITY Analysis & Recommendation 

■ Highlights: Understands how lowering the minimum word threshold for MCQ eligibility can substantially expand coverage and improve overall quality, offering the best balance between cost, quality, and 

infrastructure scalability. 

● Research into ICB dispatch 

○ Both shane and emily are out this week �� 

Search: 

● Search metrics: Looked into adding recs pages search metrics, but this is still not launched. Waiting for this to launch to add metrics to actually validate data for dbt model updates. 

Other: 

● Doing my HR training when I have time. 

Nov 18, 2025 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Notes: 

Learn: 

● XFPT1-76: Learn Quality Improvements 

● Consolidating everything for send off 

○ Just waiting for feedback 

● Looking into how to create a/b test for eligibility expansion 

○ Only looking at removing min eligibility 

● Updating tickets to reflect Q4 priorities 

● Length documentation \- starting 

Search: 

● Updated the dbt model to include a longer incremental\_date\_filter to 6 to refresh the last 7 days with every run to catch up most of the lost client side events. 

● Update actions to include all types of actions to be less restrictive 

○ Did this to capture more native users for search. 

Other: 

● Trying to work on some trainings that are due Dec 1st. 

● Helping user research team with some data needs 

● Connect with the women community at quizlet. How to make it better\!  
Nov 12, 2025 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Notes: 

Learn: 

● Pulling all the data samples 

● Compiling into a sheet 

○ I noticed I had an error with the data I was pulling so I had to fix that. Wasn’t pulling all of the distractors (duplicate answer\!)s. 

● Revise old rubric questions to be more understandable 

○ Add new rubric dimensions 

○ Get feedback 

● Behavioral Analysis: 

○ Fix errors found. Connected with Alyssa on this. Missed a lot of filtering. ○ Should be good now, but I need to update the doc to reflect new numbers. ● Connected with Tingting 

● Update Q4 Planning to have tickets and objective outcomes. 

● Eligibility A/B Test Steps Created steps to go over with Tingting (hopefully) on how to do the A/B test.   
Search 

● Core native search model. 

○ Checking logging. 

● This is starting to become a bigger push because of Native senteric push. Research: 

● Look at the two sites Jeff gave for LLM-as-judge insight. See if we can draw any conclusions. 

**Moving Forward/Feedback:** 

● Q4 Learn Plan Updated \- Make more fleshed out and add jira \+tickets ● Jeff/Deveyn/Aaron Notes 11/12 

● Q4 Planning \- Learn Quality and Study 

Nov 5, 2025 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Notes: 

Search: 

● Native core search web: 

○ Create first search native dbt model and merge it. 

○ Need to still to QA for its iOS logging. 

Learn: 

● Consolidating all requirements for MCQ judge V2 

○ MCQ Judge V2 Research Plan  
○ Collecting data 

■ Pulling context for mcqs 

■ Splitting by language 

○ Refining rubric 

● Priorities other learn projects 

○ Tbd 

Vertex: 

● Datastore looks to be updated \- should be launching a test. Go team\! Recs: 

● Updated the openai evals documentation for recs and the new notebook.PR ● Running a new eval on the data 

○ We saw no decline in recommendation relevance based on the LLM evaluation. 

**Moving Forward:** 

● Lots going on lets actually nail down what we want to work on starting this week. I'm currently only looking at the judge. I want to push this work so we can hand it off to SME and prioritize other work while they evaluate. 

**● Focus on the User-Behavior Evaluation Path** 

● Pull data for **question correctness rates** and **time-to-answer**, broken down by: ○ Distractor source (UGC, LLM, KMP, etc.) 

○ Language and set type. 

○ Whether user created the set. 

● Start building a **prototype analysis table** (e.g., in BigQuery). 

**● Simplify the Rubric** 

○ Create a **lightweight rubric** aligned with real user behavior. 

○ Document which existing rubric dimensions can be dropped or merged. **● Pair with Ting Ting** 

○ Before Ting Ting leaves next week, align on: 

■ The **non-English expansion plan**. 

■ The **simple code change** experiment (word-length heuristic). 

■ Whether to run an **A/B test** on the LLM-generated distractor 

improvement. 

**● Follow up with Aaron** 

○ Share your updated rubric and data structure. 

○ Confirm SME evaluation timeline and batch size expectations. 

**1:1 Meetings Notes:** 

Learn / MCQ Judge Evaluation 

● You’re **refining the MCQ judge rubric** and consolidating data from the **MCQ Judge research plan** with Aaron. 

● V1 only covered English; V2 will: 

○ Expand to **non-English** sets. 

○ Include **context awareness** (evaluate distractors with set context).  
○ Add **distractor length** as a proxy for quality. 

○ Collect **\~5,000 English MCQs** (and additional non-English samples). ● SMEs (via Caitlin) will handle human evaluations, ideally in **batches**. 

Rubric & Evaluation Philosophy 

● Agreement that the **current rubric is overly complex** and **not reflective of real user decision processes**. 

● Humans show **low inter-annotator agreement**, reducing the value of fine-grained human judgment. 

● There’s an opportunity to **simplify**: focus on **“obvious wrongness”** or **user-perceived plausibility**. 

Alternative Evaluation Approach 

● Instead of purely human- or LLM-judged quality: 

○ Use **user behavioral data** to infer distractor quality: 

■ **Correctness rates** — how often users pick distractors vs. correct 

answers. 

■ **Time to answer** — higher quality distractors may correlate with longer response times. 

○ Combine these with **generation source metadata** (UGC, LLM, etc.) to see which pipelines yield stronger performance. 

● Treat evaluation as a **supervised classification problem** rather than a static rubric. 

Oct 29, 2025 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Notes: 

Vertex: 26, 32, 37,46 

● Updated the dbt model to exclude sets that have not been published, and sets that are deleted. 

● Helped the team get the datastore rebuilt for testing and launch on the prod side. ● Opened a security ticket to allow the controller to read the table as well as tackle the location error we’ve been running into while trying to create a new datastore with vertex. ○ https://quizlet.atlassian.net/servicedesk/customer/portal/11/SQ-866 \- Can’t… ○ Closed ticket \-\> went different direction 

○ Vertex datadog 

● Was able to update the schema of the model to FINALLY match what we needed for vertex after all getting together and hacking it out. 

Search: 

● Logging: 

○ Checked search logging for recs pages.  
○ Doing so because I need to add the metrics to the dbt model when they have been completed. 

● Native core search web: 

○ Create first draft the model 

○ Created second pass at model \- waiting for review 

Learn: 

● Have this doc going to deep dive into all things learn. Learn Notes ● Started the planning phase of MCQ quality judge v2 

○ MCQ Judge V2 Research Plan 

● HUGE LEARN:https://github.com/quizlet/periscope 

○ All the queries for periscope 

○ Helping me to create a dashboard . The dashboard is a deep dive in language learning that occurs on mcqs. 

Oct 24, 2025 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Notes: 

● Recs 

○ DS Research PR for notebook of eval set-up 

○ Getting feedback with that 

■ Alvaro gave feedback last week, suggested using new data and doing some sampling to see the difference between old and new recs. 

■ This week focused on labeling some data to compare 

■ Recs eval should be good to go, thinking we will be keeping it in a 

notebook. 

● Search/Vertex 

○ Merged foundation pr. 

○ Looking to get the actual run-time data correctly working in a notebook. Working with Max on this. 

○ Vertex saw problems with duplication and draft sets in the data. Created a PR to fix the draft sets. No sets that do not have a published timestamp should be left out of the data now. 

● Recs pages 

○ Added some search charts 

● TBD: core\_search\_web for native dbt model 

○ Petra gave this work to me if I had some spare time, but I haven't gotten to it. ● Learn 

○ TBD? 

Moving Forward: 

● Learn Notes 

Summary of ^ doc:  
Look into/next steps: 

● development of a non-English MCQ judge to evaluate question quality across multiple languages 

● help expand LLM distractor generation by removing current word-length limits with Ting Ting. 

● align evaluation frameworks across teams to standardize rubric logic, scoring, and rationale generation. 

● Longer term, work could feed into adaptive learning and sequencing capabilities unlocked by the upcoming Study Service migration. 

Oct 15, 2025 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Notes: 

● Establishing DSA/ML responsibilities 

○ Petra asking about formally establishing dsa part-time. 

○ How should we go about this work? 

■ Good or bad idea? 

● Recs 

○ DS Research PR for notebook of eval set-up 

○ Getting feedback with that 

● Search 

○ I have a bare-bones pr in hex waiting for a review for Emily. Hopefully that's good or we iterate and then can actually tie it to some search logic. 

○ Vertex meeting 

● Recs pages 

○ Minor dbt updates and dashboarding 

● OOO Thursday/friday 

Moving Forward: 

● Learn ramp-up coming soon 

Oct 8, 2025 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Notes: 

● Search: 

○ Updating eval to work with openai on colab. 

○ Next step is to be able to get these evals to run realtime instead of using passed results and scoring. 

■ Thoughts here was given your colab 

● Recs:  
○ Getting colab notebook to be able to score recs content 

○ Currently no pipeline for this so starting off in colab 

■ Assuming next steps are to create pipeline, will need direction here 

because im not familiar with recs code 

● Recs Pages 

○ Migrating Dash when i have time 

Oct 1, 2025 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Notes: 

● Search: 

○ Met with Max, told him I integrated what we have to openai evals. 

■ OpenAI Eval SEARCH 

○ Getting some content together to send to the content team so we can finally confirm (hopefully) data quality of our judge. 

■ Little bit of spinning here 

■ Main goal/outcome: Tying to production data 

● Recs\! 

○ Had Recs ML sprint planning 

○ Work will be focusing on MLE-482: LLM as a Judge for Courses Spec ○ This sprint main goal is to have:   
■ Define an LLM-based evaluation framework that judges course-to-set and set-to-course links 

■ Specifies criteria for promoting predicted edges into trusted graph edges, and outlines a clear 

■ Production-ready specification aligned with the broader course graph strategy. 

○ We will be using Openai evals to do this. I did jump the gun, and got this OpenAI Eval Course Content LLM evals working from Alvaros old rec eval colab. \- Will be refining it based on Specs/Definitions defined.   
○ Meeting will Anil/Avaro Thursday to go over initial planning. 

● Recs Pages Dashboard: 

○ Updated the DBT PR should be good to go. 

○ Will be migrating the dash to use this table once I have time\! 

○ Note: Thread School\_id logging was forgotten for recs pages. Once it’s added, i will have to update. 

● Vertex 

○ Still playing telephone, providing the support team with everything they need to figure out our data discrepancy if we have one. 

Moving Forward: 

● Anything I should be doing that I currently am not?  
Sep 24, 2025 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Notes: 

● Search Quality: 

● Add user school data with larger sample 

● Recs Page: dbt model creation/feedback 

● Infra pr 

● Total design \- I have way too much going on in my initial dbt pr 

● Vertex: Investigated significant data discrepancy between our bigquery source table and what appears to be indexed in our vertex ai search data store. Ticket 

● Intial Findings: School association data exists in the raw structData from BigQuery imports but is missing in the Vertex AI console (which shows 

derivedStructData), indicating that Vertex AI Search is not correctly mapping or processing associated\_school\_ids and potentially other array fields into the searchable index. Awaiting feedback from google team. 

● Discussing problem with the vertex support team \- ongoing 

● Recs sync and catch up 

● Decided that I will be looking into doing evaluations. 

● Notes 

● My Steps forward \+ More alignment Notes 

● Talk to emily about openai evals \- she’s currently working on getting the pipeline set up 

● Recs Metrics dash 

● Meeting with derrick to discuss 

Jeff Feedback: 

Question to always ask when you are having trouble understanding the tasks others are trying to give: 

● What is the exact scope and deliverables? 

● When do we need it? 

● Can we do it in a way that makes it easier for others to use? 

Moving Forward: 

● Are the tasks I am doing sufficient? 

● Is there anything that I should be working on? 

Sep 17, 2025 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James  
Notes: 

1:1’s 

● Petra 1:1 what should the direction be here, now that she may be changing her role within our team \- more higher level. 

○ Both of us were wondering if we should continue 1:1 or what the direction would be. 

● Max 1:1 started a 1:1 with max to get more fluid feedback with the search quality pipeline so work progresses a little more linearly. 

○ He recommended reaching out to Alvaro to get more technical guidance and tasks. 

● Anil 1:1 receiving good info about the recs direction, work hasn’t been given from this. ○ How could I approach this? 

Work: 

Search Quality: 

● Teaming with Max more closely on this. The first iteration yielded pretty good results. Slides. 

● Shift from engagement-driven to intent-driven: 

○ Stop using result quality/engagement as a proxy for clarity. Instead, mark queries unclear only when the query \+ user \+ result context provides no clear signals of intent. 

● Make unclear rare and qualitative: 

○ Replace strict thresholds with an LLM-based judgment of query interpretability (e.g. vague fragments, random text). Unclear should reflect lack of intent clarity, not lack of validation. 

![][image5]vs   
![][image6]  
Recs Page: 

● Have most of the dashboard filled in besides how users enter the flow to the recs page. (Pending on logging).  
● Started outlining a dbt model to migrate too (Less expensive in the long run) 

Content Analysis: 

● Reached out to Charlotte for more alignment on taste building. Should be meeting with her to make the dash better. 

**Moving Forward for Next week:** 

● May have some recs work 

Sep 11, 2025 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Notes: 

● Search Quality: 

○ Presentation slides 

● Recs Page Metrics 

○ Created Dashboard 

● Content dash building analysis 

○ Created Dashboard 

● Logging 

● Vetertex dbt fixes understanding the datastore 

Moving Forward for next week: 

● Pairing 

○ Anil 1:1 

■ Some good info being shared but necessarily work 

■ Shared info: 

● S\&D top line metrics \- Aug 2025 

● dbt models for content 

● \[WIP\] Recs Dash 

● H2 Recs Brainstorm Plan 

● \[Scratch\] Jeff J Content Dash 

○ Max 1:1 

■ Search quality discussion 

● New project 

○ ?? Planning week for everyone tbd 

● Direction for the search discrepancies outside of scope for search quality pipeline ○ Thoughts: Didn’t get to talk about this 

Sep 3, 2025 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Notes: 

● Search Quality:  
○ Option to have or not have text\_blobs(yay\! A LOT less tokens to process if not using) 

○ Clustering queries based off subject classifier outputs for search results ○ Validation Testing 

● Recs Page Metrics 

○ Created Dashboard 

● Discrepancies in search results moving forward with query(?) 

○ Thoughts: 

● The subject classifier meeting didn’t produce any new work. 

Moving Forward for next week: 

● Pairing 

○ Anil 1:1 

● New project 

○ Thoughts: Anil recs work 

● Direction for the search discrepancies outside of scope for search quality pipeline ○ Thoughts: Didn’t get to talk about this 

Aug 27, 2025 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Notes: 

● Search Quality: 

○ Working on text\_blob evaluator: 

■ Checking how well the text summary matches the query and title by 

breaking it into chunks and scoring each chunk. First, comparing them by words (lexical), then by meaning (semantic), and if it’s still unclear, I ask an LLM to decide \- then combine all scores into a final relevance rating. 

○ Clustering queries: 

■ Trying to use an LLM to assign each evaluated query-title-summary to a cluster category (like "exam", "biology", "textbook") by mining patterns 

(keywords and regexes) then matching each row. 

● Dashboarding 

○ Recs Page Dashboard 

**Moving Forward for Next week:** 

● Pairing? 

Aug 20, 2025 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

**Notes:** 

Search Quality:  
● Feedback with Max: 

○ Max really likes it\! Believes there should be another iteration focused on: ■ Investigating discrepancies between live search results and those pulled via BigQuery \- trying to understand where and why the outputs diverge. 

■ Exploring options for a better evaluator for text blob set summaries in the input \- goal is to improve signal quality in the rubric. 

■ Running tests on a larger sample of queries to identify failure patterns, especially among specific query types that are underperforming or 

misclassified. 

○ How can we get this to test production data though? 

■ Future hope: Set it up so we enter in a query and return response to the notebook- Live see quality of results \- TBD because of rotting code 

↑↑ was hoping to do more with this but ↓↓ took more of my time than planned\!\! Logging: 

● Tested some web logging needed quickly 

● Identified more Native logging 

DS Stuff 

● Asked to investigate creating an alert for folders that don’t include recs ○ Did not get very far on this �� 

● Asked to create some dashboards for recs since Petra was out 

○ NOT DOING \- Lost some time on this, because petra was already on it and i was duplicating. 

**Moving Forward for Next week:** 

● Opportunity for impact meeting 

● New tasks? 

○ Maybe subject\_classifier 

● Search Quality 

○ What are expectations moving forward? 

■ Working on when i can 

● What is happening with our vertex account that was set up? 

○ Figure out schema problem 

Aug 14, 2025 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

**Notes:** 

Search Eval 

● Created a slide deck to highlight findings and process  
○ Also have summary doc here 

● Working on finetuning a model just to cross verify and see if it can tell us anything ○ May be long-tail cases in validation set that are harder to get right. 

DBT hook to SA vertex account 

● Ticket 

○ Currently Blocked: Because the security team can not add permission to an SA that I cannot see. 

Native & Web Logging: 

● Reviewing rec page logging for native and web. Ticket 

○ On-going as some logging hasn’t been deployed yet 

A/B Test Write-Ups 

● Image light index 

○ confluence 

● Set light index 

○ confluence 

● Shelf ranking 

○ Confluence 

Daily\_vistitor\_course\_instances Investigation: 

● Drop in data from edgy.daily\_visitor\_course\_instances in late july . 

● The daily\_set\_to\_course DAG didn’t run during the relevant timeframe. After checking with cursor, it looks like this DAG doesn’t affect the edgy.daily\_visitor\_course\_instances table. 

○ Given that, it’s probably not the root cause.I did notice an alert for this table on July 29\. Further investigating with petra. 

**Moving Forward for Next week:** 

Pairing ? 

~~Search eval \- feedback~~ 

Aug 6, 2025 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

**Notes:** 

Set-index-light dbt models set-up 

● Create the initial version of the set\_index\_light dbt models to generate a curated table of high-quality study sets for future use in VertexAI-powered search and ranking systems. Search Eval improvements 

● Improving input features  
● Adding rubric dimension 

● Ground truth work 

Jul 31, 2025 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

**Notes:** 

\- Work documentation 

\- Should I be moving my trello tasks into the ML board? 

\- If so, what's the ideal format? 

\- Search eval is at a solid spot for testing (yay\!) 

\- Rubric is solid Search Evaluation 

\- Problem: Looks like I have some context leakage occurring. 

\- I currently have two system prompts: 1 to strictly mark nonsensical 

queries. And 2 that loosely marks nonsensical to get a grading to the 

result. 

\- The first one seems to not evaluate what it did after I was working 

with the 2 prompt for a while. Seems a little out of my control right 

now. 

\- Will be adding the current version to ds-research. 

\- Currently designed to evaluate top result (not top n results) 

\- Next steps: Ground truth evaluation. I started doing some manual evaluations this morning. This is to get a bench mark of the model vs just saying we trust it. Graded Ground Truth Set 

\- Where do we want to go from here? 

\- Suggestions: 

\- Understanding nonsensical user input 

\- Restrict to school base course Airflow work 

\- All ETLs have been updated for this schema patch. 

SH-2446: Review/update course related airflow jobs 

\- Was a minor flaw in the original pr, so two DAGs did not run. Did retesting and a fix was deployed yesterday. Everything is looking good\! 

\- Will be checking the tables to see if there’s any missing data from the missed day 

\- Metrics  
\- Updated course and search metrics to reflect dbt schema patch petra merged before she left. SH-2597: Review/update course related Growthbook metrics 

\- Course Model 

\- Haven’t done any more investigating on this since our last talk. 

\- I currently have a new project with old training notebooks. The next step would hook up to the airflow pipeline. 

\- What’s our objective here? Have more time to dive into this 

\- Pairing 

\- Currently with Petra. Awesome because she gives me tasks to work on. \- Should I be pairing with Anil or Alvaro in a similar way ? Could it be good to establish after BTS? 

**Moving Forward for Next week:** 

Search eval full priority (Understanding nonsensical/ambiguous user input) 

Jul 24, 2025 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

Notes: 

\- Work Documentation 

\- Currently focusing on restricting school-based courses for airflow etls. \- In testing 

Jul 16, 2025 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

**Deveyn’s Update:** 

Search Quality Eval Update: 

\- Evaluation Doc 

\- Currently have LLM evaluation running 

\- Fine-tuning results have some ideas based off walk and talk w/ Aaron about adding some sort of decision tree logic within my rubrics. 

\- Add more input features (After discussion with Max could include: add ratings, copied, etc. also how many studies the set had in the last day, month, year, etc.)  
Course Modeling: 

\- Need to touch based with Tinting about this for more clarity 

\- Last conversation I had with her as an intern: 

\- “All the notebooks in ds-research were for the model development and training as well as testing the feasibility of BQ implementation solution. 

20201012\_set\_to\_course\_NLP\_production\_model\_training is the main 

notebook that creates all the BQML models. The airflow jobs were 

developed separately and they were set up to use these model to make 

inferences daily” 

\- According to petra theres still some work that lives in Associations and recommend here 

\- Core set\_to\_course script 

\- Extract features for course model 

\- SetToCourseNLP 

Other Course related things: 

\- Update course related metrics in Growthbook to exclude exams (JIRA) (on-hold for DBT updates) 

\- Update course related code in Airflow after courses table schema update (exclude exams) (JIRA) 

\- Need more context from petra (not priority this week) 

\- Periscope alerts for canonical schools and courses being deleted 

Jul 9, 2025 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

**Search Quality \- \#1 priority** 

\- Getting really good at LLM based evaluations for set search. 

\- User location, language, etc… 

\- Does LLM quality agree with actual click and study behavior 

\- Getting a working definition of search abandonment – we don’t know this\! 

Good outcomes: 

\- We learn about queries that aren’t working and have high abandonment or refinement. “Biology” → “cellular whatever” 

\- What would explain this? LLM ask for a reasoning trace in the response. \- We learn some things to help inform the Vertex AI search 

\- Vertex AI Search \- Road to an experiment 

\- Using Vertex AI Search.ipynb (Max and Brandon have the fuller formed query)  
\- We can speak intelligently about how users are searching on Quizlet. What’s working, what’s not 

\- The pipeline or process can help identify regressions during query re-writes or experimentation. 

**Analytics Support \- \#N priority** 

\- There’s a pretty big gap right now in the company with analytics support. This is good to work on \- make sure you’re learning about Growthbook, our internal metrics, logging, etc….treat it like a place to dig deep. 

**Course Modeling \- Very high priority, possibly medium term horizon** \- Anil is working on Course clustering 

\- Read this\! Content Coverage \- BTS'25 

\- The models don't use our millions of labeled examples since 2024\. 

\- Easy to retrain, or lots of baggage. 

Meta: 

\- Carve out a few hours a week to keep learning things. AI evals, AIengineer youtube channel is good. Ycombinator YT channel has good stuff. deeplearning.ai . Safari books online (oreilly learning) 

Career development: 

\- Religiously → 

\- 1\) never document their wins (ME) 

\- 2\) every week logs in a simple file, what they did, what they learned, how to improve/change/iterate (10 mins) 

\- Highest compound value over many months 

Reach out to Ic5s 

\- Catch up with Derrick, Lauren, Cheng 

\- Say hi to Zheng async 

Zheng Li User Manual July 2025 Quizlet

# **Wins for Review 2**

**Every week log what you did, what you learned, how to improve/change/iterate ![][image7]**  
**Jira Epics:** 

MLE-630: MCQ quality improvement 

LEARN-1742: M1 \- Inline Explanations Learn Remediation 

MLE-482: LLM as a Judge for Courses Spec 

MLE-221: Search quality 

GDS-784: Search & Discovery Data Science Board 

SH-2705: Vertex AI Integration 

SH-2827: S\&D dashboards revival 

LEARN-2178: Remove Min Eligibility for LLM Distractor Generation Eligibility A/B test LEARN-2246: Learn Rewrite Learn rewrite epic 

MLE-874: Study Performance Optimizations 

Tingting notes 

Career Development: Wins 

Monthly Progress 

Look at OpanAI Depractions 

https://app.periscopedata.com/app/quizlet/1232732/\[OFFICIAL\]-Set-Creation-Executive-Dashbo ard 

Ask cursor to create a digram about how the study service works and flows for creating questions like mcqs, sata,written, revealself assessment, like an overall cheat sheet to the study service to really break down how things work \- there just so much to remember 

SPRINT 11| May 29, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

What was accomplished: 

Written Grading: 

● Inherited Aaron’s V5 spike & onboarded 

● Forked deveyn/smart-grading-v5-research from Aaron’s branch 

● Confirmed missing gitignored artifacts: queue.sqlite3, Groq logprob JSONL, key CSVs 

● Data recovery & V5 quality reproduction (κ=0.583)  
● Flagged that Aaron’s regen doc referenced CSVs that weren’t actually tracked (.gitignore) 

● Got handoff bundle from Aaron via GCS 

(gs://qzlt-dev-smart-assist-v3-canonical/wag\_v5/deveyn\_handoff/) 

● Rebuilt queue.sqlite3, regenerated Groq logprobs 

(d4\_rubric\_examples\_deveyn\_regen.jsonl) 

● Reproduced published κ=0.5829 on 384/412 train/test split (vs 0.585) ● Saved corrected LR head: d4\_rubric\_examples\_canonical\_v2.pkl (C=1.0, class\_weight='balanced') 

● Found 3 doc/artifact inconsistencies (broken champion pickle, C=10 vs C=1, prompt size claim); flagged to Aaron 

● Experiment 6 Path A latency benchmarking (\~$19 GPU spend) 

● A100 40GB: p95=132ms sequential, \~8–9 RPS max, misses 100ms hard target ● H100 80GB spot: p95=35.8ms @ 30 RPS, 49.4ms @ 100 RPS, still headroom at 200 RPS Path A viable 

● FP8 KV cache: slightly slower; not worth enabling 

● L4 24GB: p95 floor \~240ms, saturates \~5 RPS ruled out 

● Burst test (H100): simultaneous 30-submit classroom burst p95≈342ms; Poisson steady-state still fine 

● Built benchmark harness, copied raw JSONL results to experiment\_6/results/ ● Self-hosted quality validation 

● Wrote validate\_quality.py to score benchmark logprobs with canonical LR head ● vLLM H100 κ=0.562 (Δ−0.02 vs Groq, within noise); quality \+ latency both pass ● V4 production cost anchor (for V5 comparison) 

● Queried Datadog k8s metrics; corrected pod-count and Istio overhead mistakes after review 

● Anchored V4 at \~$46k/yr list (60 pods, no HPA) → Path A H100 spot (\~$58k) is modest premium vs V4 

● Documentation & artifacts produced 

● DEVEYN-REPRODUCTION-NOTES.md, V5-FINDINGS-DEVEYN.md, experiment\_6/REPORT.md, SESSION\_LOG.md 

● eval\_canonical.py, eval\_with\_pickle.py, HANDOFF\_README.md, 

METHODOLOGY.md 

● GCP infra: subnets \+ Cloud NAT in us-east4 (H100) and us-east1 (L4); VMs stopped, disks preserved 

● Strategic outcome 

● Path A (self-host Qwen3-32B on H100) is production-viable on quality and latency 

● Decision is now cost vs time-to-ship (Path A \~1–2 wks vs Path B DeBERTa distillation \~4–6 wks, \~3–10× cheaper) 

● Recommended next step: file on-demand H100 quota \+ brief Robin/Shane, or start Path B experiment\_7 in parallel 

Other: 

● SLOs for study service  
○ Had a bunch of pods restarting and under availability because of this PR ● Distractor V9 analysis 

○ Looked into segmenting off of answer length and pulled data from both variants to see differing distractors and quality 

Learn v9 control and experiment questions 

■ Could be useful to add correctness rate here too 

■ https://app.periscopedata.com/app/quizlet/1289183/Deveyn-Learn-Scratc h 

Learnings: 

● Reproducing ML results depends heavily on artifact management and documentation quality; missing tracked assets can materially slow validation and onboarding. ● Successfully validated V5 quality end-to-end, reproducing published performance and identifying several documentation/model inconsistencies. 

● Self-hosted H100 inference meets both latency and quality requirements, making Path A technically viable for production. 

● Benchmarking highlighted the importance of testing both steady-state and burst traffic patterns when evaluating production readiness. 

● For Learn distractors, segmentation analysis suggests there may be meaningful quality differences across question characteristics that warrant deeper investigation. 

How to Improve/Change/iterate/Moving Forward: 

● Drive a production recommendation for V5 based on cost, latency, quality, and delivery timelines. 

● Standardize research handoff and reproducibility practices across experiments. ● Deepen Learn quality analysis using correctness and segment-level metrics. ● Continue improving service reliability through stronger monitoring and validation of infrastructure changes. 

SPRINT 10| May 22, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

What was accomplished: 

● Applied Gen AI Onsite 

● Study optimization full documentation: 

https://us5.datadoghq.com/notebook/284387/study-service-optimization-journey ● SLOs for hex-study 

● Question-gen consolidation PR reviews 

● SA3 Learn eval final iteration and findings 

Learn Question Quality (SA3 \+ Distractors V10 vs Production) 

● Ticket clean-up 

Note: This week was mostly the offsite and collaboration with the team so im keep it short.  
SPRINT 10| May 15, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

What was accomplished: 

Study Service: 

● LEARN-2656: Questions taking long time to load Fix for a cache freshness race condition in \`study/question-generation\` where async ML predictions (SATA, distractors, card-side recs, card parsing) arriving after a cache write would be ignored for up to 10 minutes. The fix adds a lightweight parallel timestamp fetch on every cache hit, and if any prediction is newer than the cache, it synchronously regenerates and returns fresh questions on that same request rather than waiting for the background staleness check. You also added a \`regeneration\_reason\` metric tag and covered the new logic with 10 unit/controller tests, including one that directly reproduces the race condition. ○ Helped decrease % fallback as well 

● SA3 Learn Eval: 

○ Started evaluation for manual vs SA3 

■ Pipeline building \+ manual data pulling, etc. 

■ Learn Question Quality (SA3 \+ Distractors V10 vs Production) 

■ Main takeaway: SA3 cards score 86.89% Good vs 85.62% for human cards (both using A4 distractors), a difference of only 1.27pp with 

substantially overlapping CIs… meaning SA3 is effectively at parity with 

human-authored cards on question quality. 

● Infra Scaling and changes: 

○ MLE-1001: Up hex-study pod count 

○ Still in discussion but current HPA:17, Max:300, Min:50, CPU:300m 

● SATA Duplication (LLM) 

○ LEARN-2454: SATA shows duplicated options finally closed this PR, was just a version issue. Once that was fixed, the fix could be seen in prod.   
Study Optimizations: 

● Clean-up: MLE-999: \[Clean up\] asyncio.sleep()s affecting trace visibility started PR Other: 

● LEARN-2745: Preserve previous question payload for grading lookups during rege… ○ This ticket was created because Sam initially thought that the freshness change I merged in was causing a race condition between generation and get-by-id, but it's actually a race condition between get-by-id and grading. 

■ We decided that they'll cache the current question in Redis on the Go side, so we don't need to do anything on our end. 

Learnings: 

● Cache freshness bugs in async ML pipelines can silently degrade user experience for minutes at a time; lightweight parallel timestamp checks are a low-cost way to detect staleness without blowing up the cache-hit path  
● SA3-generated cards are statistically at parity with human-authored cards (86.89% vs 85.62% Good), validating that AI content generation doesn't meaningfully hurt Learn question quality 

● Race conditions often have multiple layers — LEARN-2745 revealed a separate get-by-id vs grading race that was initially misattributed to the freshness fix, highlighting the importance of careful root cause analysis before acting 

● Infrastructure scaling decisions (HPA min/max/CPU) are still in flux, suggesting that service load characteristics aren't yet fully understood and need more data before settling on stable targets 

How to Improve/Change/iterate/Moving Forward: 

● Use the regeneration\_reason metric tag to quantify how frequently the stale-inference race was actually hitting prod, and measure whether sync regeneration is adding meaningful latency at scale 

● Push the SA3 eval further by expanding beyond MCQ Judge parity — look at downstream Learn metrics (correct rate, rounds to mastery) to see if SA3 content affects actual student learning outcomes 

● Formalize the HPA/scaling discussion with load test data rather than reactive tuning, so min/max/CPU targets are grounded in traffic projections rather than observation ● The SATA duplication fix being a version issue suggests dependency version drift is a risk — worth adding version pinning or automated checks to catch this class of bug earlier 

● The Go-side Redis caching solution for LEARN-2745 introduces a new dependency; monitor cache hit rates and staleness there to avoid introducing the same class of freshness bug on the grading path 

SPRINT 9| May 8, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

What was accomplished: 

Study Optimization: 

● Decided for Next sprint we will Update question generation request format to stop depending on set properties (in particular, use languages from studiables service instead, and drop the set title, and LastModifiedSeconds) 

● Discussion around Processor Pool work. Addressed PR comments but we ultimately decided to drop because of complexity. If needed, we have the PR 

MLE-988: hex-study process pool 

● Once we reverted the CPU change back to 300m MLE-993: Lower HPA CPU target We then decided to target the HPA by changing the targetCPUutilization for 65 to 40\. This really helped the event loop lag metric and a lot of other metrics. The reason was lowering the HPA target gives the workload more independent Python processes to land on, reducing the chance a fast request gets stuck waiting behind a slow generator.  
○ After the HPA change, event loop blocking dropped from \>5% to \<5% of requests waiting 100ms+, meaning the slow-blocks-fast problem is largely solved. p95 cache-hit latency is already in good shape, and the remaining p99 tail is likely 

CPU-bound work that concurrency tuning won't address. Overall, we're at a point of diminishing returns and further optimization effort is hard to justify. 

● Tried upping the study service CPU to 1\. MLE-992: up hex-study cpu ○ Ended up having to revert because of negative effects. We believe it was because of The HPA on hex-study targets 65% CPU utilization, where utilization is computed as actual\_cpu / request\_cpu. Tripling the request from 300m → 1000m divides the reported utilization by \~3.3 for the same real load. So even at the same actual workload, the HPA thinks hex-study is now running cool, and scales down. 

Study Service: 

● Started a PR for updating the freshness check to help show sata questions more quickly LEARN-2656: SATA taking long time to load This will be taken over into the next sprint.   
● Created a PR to enable rich text for fallback flow: 

LEARN-2676: Enable bolding for distractors 

● Investigates this ticket 

LEARN-2617: Web | User doesn't get prompted to answer written questions with b… ○ Decided not to prioritize because we see this in both new and old flows ● MCQ and SATA Duplication 

○ On radar but not being prioritized. I thought I fixed the SATA issue but we are still seeing it. 

○ LEARN-2454: SATA shows duplicated options 

Other: 

● PR reviews 

● Setting up testing with GO (a pain in my butt) 

Learnings: 

● Lowering HPA CPU target (65 → 40%) is more effective than increasing CPU allocation because it gives workloads more independent processes, reducing fast-request blocking ● Increasing CPU requests can backfire by artificially deflating reported utilization, causing HPA to scale down at the same real load 

● Process pool complexity wasn't worth the tradeoff. Still trying to figure out if it will be with Ridwan’s work complete. 

● How to test HEX locally with Go services\!\! 

How to Improve/Change/iterate/Moving Forward: 

● Revisit SATA freshness check PR (LEARN-2656) next sprint to unblock faster SATA question loading 

● Monitor HPA behavior closely after any CPU request changes, always recalculate effective utilization impact before deploying 

● Investigate SATA duplication (LEARN-2454) more rigorously since the assumed fix didn't hold  
● Improve GO testing setup and document the process to reduce friction for future test configuration work 

SPRINT 9| May 1, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

What was accomplished: 

Study Optimizations: 

● Created a plan for the processor pool work 

● This was the main focus this week. I started a PR here 

https://github.com/quizlet/service-inference-lookup/pull/3769 which when a cache miss comes in, question generation was running on the main event loop and holding the GIL, causing cache hits to queue behind it. The fix has two parts: move generation into a worker process so the main loop stays free, and pass the worker's output bytes directly to Spanner and the Go response without the parent rebuilding Pydantic objects on the loop. 

○ Did a lot of local verifying and benchmarking 

Study Service: 

● Addressed 

○ LEARN-2454: SATA shows duplicated options 

○ LEARN-2554: Fallback MCQ duplication 

○ Did local testing and verification to make sure everything worked 

● Also helped Annika with this ticket 

LEARN-2564: Old Set SATA questions are working for old and new learn, but newl… Workspaces: 

● Another pass at the ML engineering doc Workspaces\_ML\_Source\_of\_Truth.md (needed to be updated for more depth)   
Other: 

● Denver earth day volunteering 

● Help test out new Smart Assist models 

SPRINT 8| Apr 24, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

What was accomplished: 

Study Service: 

● Started work and investigation on these tickets: 

● Initially tried to use Ravi’s PR without fully understanding what the bugs were so I lost time on that..But took some time to dive into these tickets and diagnose them. ○ LEARN-2564: Old Set SATA questions are working for old and new learn, b… ○ LEARN-2454: SATA shows duplicated options | Comment  
○ LEARN-2554: Fallback MCQ duplication | Comment 

■ PR Study 

● MCQ in-set distractor selection uses an equivalence key on each 

card’s word/definition text. The text key was only strip().lower(), 

so the same “visual” string with different internal whitespace (e.g. a 

space before \\n vs none) got different keys and two fallback 

distractors could appear for one question. We now build that text part 

of the key with a single pass that strips, lowercases, and collapses all 

runs of unicode whitespace to one space, matching the intended 

“same on screen \= same key” behavior. 

■ PR KMP 

● Fix a distractor deduplication bug where cards whose text is visually 

identical but differs only in internal whitespace (e.g. a space before a 

newline \- example seen:"B \\n(or C-flat)" vs "B\\n(or C-flat)") 

were assigned different equivalence keys, causing both to appear as 

options in the same multiple-choice question. 

● Root cause: computeEquivalenceKeyForCardSide and 

normalizeForDistractorComparison only called 

.trim().lowercase(), which collapses leading/trailing whitespace 

but leaves internal runs of whitespace untouched. Two strings that 

render identically in the UI (the newline becomes a line break; the 

space is invisible) produced different keys, so the dedup filter never 

caught them. 

● Updated ML distractor page 

Study Optimizations: 

● Merged moving the generators off the main loop last week, started an audit on what could be next steps going forward gist 

● Create a PR to Chunk Generators 

○ Add cooperative yielding to generate\_mcqs\_by\_fallback, 

generate\_flashcard\_questions, and generate\_written\_questions. All three are async def with no await, so asyncio.gather can't interleave them and the first coroutine runs to completion before the next starts. Inserting await asyncio.sleep(0) every QUESTION\_GENERATION\_YIELD\_EVERY\_N\_CARDS cards (default 10\) lets the three generators round-robin cooperatively on whichever event loop they're running on. 

○ Original hypothesis (did not hold \- see post-merge note) 

○ Targeting python.event\_loop.lag\_ms p99 \~229 ms and cache-hit study.latency p99 \~370 ms. The theory was that the outer run\_in\_executor held the GIL for the entire card loop, and that await asyncio.sleep(0) would convert the default \~5 ms CPython thread-switch heuristic into a deterministic GIL hand-off so queued I/O callbacks (especially fetch\_cached\_questions\_from\_spanner completions) could make forward progress. 

○ Post-merge note 

○ After deploy, neither event\_loop.lag\_ms nor question-generation latency moved meaningfully. Two assumptions in the original hypothesis turned out to be wrong:  
○ run\_in\_executor does not hold the GIL for the whole card loop. CPython's sys.setswitchinterval auto-releases the GIL roughly every 5 ms regardless, so the main thread was already getting slices \- it wasn't GIL-starved. 

await asyncio.sleep(0) does not release the GIL. It's a pure asyncio yield: it hands control to the next ready task on the same event loop, on the same thread, still holding the GIL. The native-sleep syscalls that actually drop the GIL are 

time.sleep(...), blocking I/O, and C extensions that explicitly release it. 

Combined with the call-path topology (generators run on an inner event loop created by asyncio.run(...) inside the worker thread), the yield goes to that inner loop \- useful for interleaving the three generators on the worker, but invisible to the main request loop and the cache-hit callbacks we were trying to unblock. Local tests showed a lift because pytest-asyncio runs the generators directly on the test loop, so the yield went to the loop we were measuring. 

● Created a PR to Offload Build Groups 

○ Offload \_build\_mutation\_groups\_for\_save (sync pydantic model\_dump 

\+orjson.dumps \+ gzip.compress \+ protobuf construction) off the main event loop via loop.run\_in\_executor(None, lambda: ctx.run(build\_fn)) so cache-hit requests stop sitting behind serialize CPU during cache-miss saves. 

○ Added a spanner\_save.build\_mutation\_groups ddtrace span and a study.latency distribution tagged step:build\_mutation\_groups\_for\_save around the offload, emitted from a finally block so it fires on both success and builder-exception paths. This gives us a standalone signal for the serialize step independent of the outer SAVE\_QUESTIONS\_TO\_SPANNER metric. 

■ Both PRs landed flat because 

Other: 

● On Campus User Research 

● Workspaces Doc consolidation work Workspaces\_ML\_Research\_Document copy Learnings:   
● Double check bugs and make sure you can diagnose where they are coming from.Don’t just trust someone has done the work for you 

● Jumping into someone else's PR without fully understanding the underlying bug first burned real time \- context-gathering upfront is faster than debugging a solution that's already misaligned with the problem 

● SATA and fallback MCQ bugs (LEARN-2564, LEARN-2454, LEARN-2554) surfaced how fragile question-type-specific logic is when it's interleaved rather than isolated \- edge cases compound quickly when multiple question types share control flow 

● Study optimization gains don't always hold \- latency creeping back after the raw dict PR shows that system-level changes can be masked or reversed by factors (e.g. request volume increases) that aren't visible in the original benchmark window 

How to Improve/Change/iterate/Moving Forward: 

● Before picking up bug tickets, spend time reproducing the issue independently rather than starting from an existing PR… reduces the risk of inheriting wrong assumptions  
SPRINT 8| Apr 17, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

What was accomplished: 

Study Service: 

MCQ Location Bug: LEARN-2486: Diagram MCQ location and sort bug ● Location-prompt MCQs (LOCATION \-\> WORD, LOCATION \-\> DEFINITION) were being silently dropped for diagram set cards with all three sides populated (word \+ definition \+ location). Because of the answer-side precedence loop. 

● Created a PR to fix this by separating location-prompt fallback MCQs from the answer-side precedence loop. Since ML can never produce location-prompt MCQs, they should never compete with ML's text-based MCQs for the same answer-side slot. They are collected unconditionally and appended after the loop. 

MCQ Sort Logic Correction: Same ticket as above 

● In addition to the location bug there was a discussion in the go service about MCQ question order here. Decided this logic should all be handled in HEX and was asked to include it the MCQ Bug PR above. 

○ Fixed that by applying a direction-tier primary key so the Go study service's first-ref deduplication selects the right direction when multiple directions exist for the same card. See pr description for preferred order the team landed on. 

Study Optimizations Work: 

● Saw latency creeping back up after our raw dict question-gen PR was merged. Investigated that for a while with the team. Thread. Currently I still don't really know what's happening \- thought it was because requests increased. But it could be something else occurring. Also good investigation notes by Aaron 

● Started the last clean up PR needed from the raw dict PR. 

MLE-957: Remove \_spanner\_is\_enabled guard from question-generation cache fe… MLE-959: Deduplicate Spanner question-cache read query between typed and ra… ○ The change simplified and hardened the Spanner caching layer by removing legacy feature-flag logic and reducing duplicated code. 

○ Follow-up: MLE-972: \[Follow-Up\] compressed\_question\_json in question ref… ● Created a new PR to offload the question generators 

MLE-971: Move CPU-bound Question Generators to run\_in\_executor 

○ Moved CPU-bound question generation off the main asyncio event loop using loop.run\_in\_executor(None, ...) inside generate\_selected\_question\_types. ○ Didn’t see any changes from this PR though. 

○ Follow-up: MLE-974: \[Follow-Up\] Evaluate dedicated executor and cancell… Other:   
● Some workspaces meetings 

● Chats with Sam about expanding sort logic to other question types for diagram sets. He’s OOO so this will probably continue next week. 

● Looked at Aaron’s Smart Assist Eval Doc here  
Learnings: 

● Isolate concerns in precedence logic. When ML and rule-based generators compete for the same slot, any MCQ type that ML can never produce (like location-prompt) must be pulled out of that loop entirely, otherwise it gets silently dropped with no error signal. 

● Direction-tier sorting belongs in the service that owns deduplication context. ● Latency regressions after optimization PRs aren't always caused by the PR. Increased request volume or other concurrent changes can mask or mimic regressions, isolating the true cause requires ruling out traffic shifts before blaming code changes.Sometimes things can stay a mystery. 

● Async event loop offloading doesn't always move the needle. Moving CPU-bound work to run\_in\_executor is the right architectural pattern, but if the bottleneck is elsewhere (I/O, Spanner, network), the gains will be invisible.. 

● Legacy feature flags accumulate hidden complexity. Removing the \_spanner\_is\_enabled guard and deduplicating the Spanner query paths reduced surface area for bugs and made the caching layer easier to reason about, cleanup PRs like this pay compounding dividends over time. 

How to Improve/Change/iterate/Moving Forward: 

● Coordinate on next steps for work. Optimization work is complex, it good to get eyes on the work before starting. 

SPRINT 7| Apr 9, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

What was accomplished: 

Sort question generation output by card side recs: 

● Was able to finally get this PR merged. Which means for the hx we now can Sorts each question type's list by cardSideRecommendationRank during question generation, so FIRST\_CHOICE questions appear before SECOND\_CHOICE before NOT\_RECOMMENDED before absent. 

○ After this was merged I has a conversation with Sam and he’s said that the sort was working but we needed the cards to also show up in an certain order for the go service. 

■ So I opened another PR where now sort\_questions\_by\_recommendation now sorts by (1) card-side recommendation rank and (2) studiableItemId 

within each rank tier. 

● This was able to fix Sam’s problem. 

● One thing to note was: Card side recs doesnt work with diagram sets 

sets or n-sided cards well so we just need to remember that for future 

work. 

● Hex Study Optimization 

○ Started the PR for the raw dict pass with the question generation endpoint. It Skip Pydantic model construction and serialization on the question-generation cache-hit path, mirroring the same optimization applied to the question-sequence endpoint in \#3621. 

○ Profiled and checked the MD5 to make sure the data wasnt changed.  
○ Saw HUGE improvement from this PR slack thread 

■ Drops on hex-study, question generation, question sequencing, fallback questions, study-bites, etc. I**t really validated that the event loop being** 

**tied up by other requests is a big part of the issue.** 

■ Why question-sequence didn't unblock the loop originally 

● PR \#3621 fixed the Pydantic pipeline in question-sequence, but 

question-generation was still running the old code. **Because they** 

**share the same event loop**, question-generation at 4× the traffic 

was still continuously polluting the loop. It's like clearing a clog in one 

sink while the main drain is still blocked — water backs up 

everywhere regardless. 

● Once PR \#3701 landed and replaced the question-generation 

cache-hit path with just a dict comprehension \+ ORJSONResponse, 

both layers of blockage disappeared: 

● No Pydantic construction on the event loop. Virtually no thread pool 

pressure (dict comprehension is microseconds vs. milliseconds of 

Pydantic) 

● The event loop opened up, and every endpoint in the service, 

including question-sequence, benefited immediately, which is exactly 

what the service-level latency drop in the first screenshot shows. 

○ On the PRs above that we merged there were notes to create clean-up follow ups and code quality follow ups so I ticketed all that out. 

MLE-874: Study Performance Optimizations 

○ Started working on clean up prs before further study optimization changes. ■ PR \[Study Service\] clean up old pydantic flow on question-sequence 

■ PR \[Study Service\] clean up dead code for question-generation 

■ Still have another one in flight for \_spanner\_is\_enabled removal \+ SQL query deduplication on the question-generation. 

● Other: 

○ Platform team changed the domain for 

https://inference-lookup.k8s.staging.quizlet.engineering/docs 

■ So i had to update the local domains to reflect the new change (they didn’t tell us about) for local study domain testing 

■ PR 

○ DX Survey 

○ Give Kara Hack Week Segmentation work 

Learnings: 

● How to profile and check MD5 locally. 

○ It's hard because local profiling doesn't show what will actually happen in prod. ● Event loop contention is a service-wide problem, not a per-endpoint one, fixing one endpoint's Pydantic pipeline doesn't (didn’t) fully unblock the loop if other high-traffic endpoints are still running blocking code on it. 

● Throughput asymmetry matters: question-generation running at 4× the traffic of question-sequence meant it was the dominant source of loop pollution, even after question-sequence was already optimized.  
● Card side recs have meaningful edge cases (diagram sets, n-sided cards) that should be scoped out explicitly when planning future sort/recommendation work. 

● Infrastructure changes (like domain migrations) from platform teams don't always come with advance notice \- worth building in a check during local testing setup when things break unexpectedly. 

How to Improve/Change/iterate/Moving Forward: 

● Finish the remaining cleanup PRs (Spanner `is_enabled` removal, SQL query deduplication on question-generation) before layering on further optimization work \- keeps the diff surface clean and reviewable. 

● Consider whether staging profiling tooling can be made more accessible so perf validation doesn't rely entirely on prod signals after merge. 

● For future optimization PRs, document the "why question-X didn't unblock question-Y" reasoning upfront \- the event loop mental model is non-obvious and worth capturing in the PR description for reviewers. 

● Socialize the card side recs edge case (diagram/n-sided) as a known limitation, possibly in the studiable metadata / precursors docs, so it doesn't get rediscovered later. ● Follow up with a platform on notification process for domain/infra changes that affect local dev workflows. 

SPRINT 7| Apr 3, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

What was accomplished: 

Enabling Diagrams: 

● Initially thought the work was done but on monday found that we were creating questions when a term or definition was null which we didnt want and also found out that we were missing some study directions with the locations. 

○ Created to PRs to address this and also helped with debugging for CE when they were trying to use it in prod 

○ Everything should be good now. 

Images: 

● There’s a few tickets about image work. Image Tickets 

● I started a pr to address a ticket that was needed for the learn tea, 

○ PR \- Fixes MCQ fallback generator (Flow 1 / heuristic in-set distractor selection) to include images in option media for answer sides that have an image with no text, or text and image together. 

● This was merged and now the study service uses images in the fallback Card side recs: 

● This work was handed over to me later in the week. 

● Had to review the PR started by Aaron. I addressed further questions and is taking over the work.  
○ PR Sorts each question type's list by cardSideRecommendationRank during question generation, so FIRST\_CHOICE questions appear before SECOND\_CHOICE before NOT\_RECOMMENDED before absent. 

○ Waiting for review 

Study Optimizations: 

● study optimization work 

● Started looking into what this means and how to improve latency on Hex-study. ● Took over PR from Aaron and addressed comments 

○ It skips Pydantic model construction and serialization entirely for the 

question-sequence endpoint. Questions are fetched from Spanner as raw dicts, sorted/filtered/deduped on dicts, and serialized directly into the response via ORJSONResponse. This follows the same pattern that question-lookup-by-ids already uses. 

■ Will also need to clean up dead code in the question-sequence 

● Started figuring out how to profile locally and started work to do the same for the question-generation endpoint with a raw dict. 

Learnings: 

● Figuring our precedence for work. All seem very useful to get done but some work blocked others so i took that over first even though other people were telling me to do other things. Figuring out how to balance 

● Learned how to profile locally thanks to aarons PR on profiling 

● Figuring out how to optimize latency. 

How to Improve/Change/iterate/Moving Forward: 

● Continue just trying to work the the things that matter. 

● Ask for help. 

● Always test locally\! 

SPRINT 6 Mar 27, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

What was accomplished: 

Rewrite analysis LEARN-2246: Learn Rewrite : 

● Data For Rewrite Eligibility Added 300 holdout for evals. 

○ Ran eligibility model evals across 5 prompt versions (v1–v3no) on 300-card training set, 102-card holdout, and 300-card holdout. On the 300-card holdout, v2 and v3no are the best bets for served quality (F1 \~0.57, v3no best recall/FN count); v3ex is still the best for card-level and D2 holdout metrics and for training-set served metrics 

○ Evaluated card-level, per-direction (D1/D2), and served-direction metrics; v3ex emerged as best on precision/F1, v3no as best on served recall (0.968, 1 FN) ( ○ Ran swap-invariance tests across all prompt versions; found v2/v3no most stable, few-shot prompts (v1, v3ex) most order-sensitive  
○ Documented key precision ceiling (\~40–47% on holdout) driven by term+def-only constraint and "distractors save it" cards 

○ Compiled full findings doc with prompt recommendations and next steps (FP error analysis, pre-filters, D1 data expansion) 

○ Rewrite LLM Eval 

Study Tickets: 

Was assigned multiple tickets: 

Priority 1: 

\- Don’t just do the tickets, document the whole flow to understand performance at each step/endpoint 

MLE-874: Study Performance Optimizations 

\- 3 ish tickets here i think 

Priority 2: 

\- Look into images \-\> quality tradeoff before starting to understand what including images will do 

~~DH \- LEARN-2352: MCQ option with only image is blank~~ 

\- LEARN-30: Missing images on MCQ distractors (overlap or dupe) SM/DH \- LEARN-2379: Don't show sets with images in ISBs, but keep for Study CTA 

Done: 

~~DH \- LEARN-1642: Distractors referencing MCQ tags (e.g. "Both A and B") should …~~ \- Tingting worked on \- has pr merged 

~~DH \- LEARN-2263: Handle special character input~~ 

\- Closed 

I was able to put them in order of priority moving forwards for work now the eligibility is on hold. Study Performance Optimizations: 

Started looking into MLE-902: Up CPU and worker count for hex study service ● Asked emily about from MLP perspective need to ask further clarification question before asking wider group. 

● Started looking into the code as well’ 

Other: 

● Merged in the final PR for the MCQ diagram work 

● Reviewed Ridwans study migration PRs 

● Meetings 

Learnings: 

● Precision is currently fundamentally capped at \~40–47% on unseen data when only term+definition is available 

● Swap-invariance is a real deployment risk; input order must be locked canonically before any further eligibility model work to avoid silent failures  
● D1 (term-as-question) is underrepresented in prod data and can't drive production decisions yet \- D2 carries nearly all the signal 

● Study service performance work requires MLP alignment before diving into infra changes \- important to surface blockers early rather than go deep in code first 

How to Improve/Change/iterate/Moving Forward: 

● Eligibility: lock canonical input order, run FP error analysis on the 49 v3ex holdout FPs, explore a two-stage pre-filter ("is this even answerable as a question?") to break the precision ceiling 

● Eligibility: expand D1-positive labeled data with targeted sampling before making D1 metrics actionable 

● Study tickets: document the full flow/performance at each step before executing on MLE-874 and related tickets \- understanding the system end-to-end will make fixes more principled 

● Images: assess quality tradeoff from including images before starting LEARN-2352/LEARN-30/LEARN-2379 work to avoid scope creep 

● Follow up with Emily \+ wider group on CPU/worker count question for MLE-902 to unblock the study performance work 

SPRINT 6| Mar 20, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

What was accomplished: 

Rewrite: LEARN-2246: Learn Rewrite 

● Last week I created an analysis to figure out what questions to scope into the rewrite ○ This week i focused on actually looking at that data to really understand the target % of what cards would be eligible for the rewrite. We were focusing on answer given away. 

○ I pulled and labeled a sample of \~300 prod cards across three buckets (all English, no images, filtered to exclude cards the card parser would handle): ■ 200 general \- a random prod sample meant to approximate a uniform distribution 

■ 50 verbatim \- cards where the correct answer literally appears as a 

substring in the prompt text 

■ 50 root word \- cards where an unusual keyword (\>6 chars) from the 

answer appears in the prompt 

○ I graded each card across 4 dimensions: 

○ 1\. If the term is used as the question, does it give away the answer? 

○ 2\. If the definition is used as the question, does it give away the answer? ○ 3\. What was actually served as the prompt text (recommended study direction)? ○ 4\. Do the distractors make the answer even more obvious? 

○ I went through the labeled data and realized it is harder to nail down than it looks. Just because a keyword appears in both the term/definition and the correct  
answer doesn't automatically mean the answer is given away.. it depends on how the question is structured and whether the distractors compensate. ■ To get a cleaner baseline, I filtered to just the general source to approximate a uniform prod distribution. This gave us 8 yeses / 192 nos (\~4%) as a more representative prod number for right now. From there, the plan is to order the yes cases from most bad to least bad to find where the line is, since some are unambiguous and some are clear edge cases. (This changed to \~2% hard floor (clearly bad only) \-\> \~4–4.5% if including bad \+ distractors-save-it. the 10 distractor-only cases are out of V1 scope once We looked at the bins) 

■ I then binned these be different categories to see what type of give away occurred: 

● **clearly bad (37)** answer given away by the question/answer alone, no distractors needed. the term or def contains the answer word, the question defines itself, or the answer is the only blank being filled. 

● **bad (5)** answer feels telegraphed through keyword or structural echo, and the distractors compound it by being obviously wrong or off-topic. 

● **bad \- flawed options (4)** question has options embedded in it and the answer is one of them, but distractors come from a completely different set, so the correct answer is the only one that matches the original list. 

● **bad \- but distractors save it (8)** term/def alone looks suspicious (phrase echo, structural mirror) but distractors are 

well-constructed enough that you still need real knowledge to pick correctly. important for the eligibility model- term/def signal alone would over-flag these. 

● **borderline (3)** genuinely hard to call. signal exists but a 

reasonable person could go either way. these are the ambiguous cases. 

● **correct options (15)** not a rewrite target i think but question has embedded options and answer is one of them, but distractors also come from that same option set. intentional question design, not a leakage problem. exclude from rewrite eligibility. 

● **distractors only (10)** question/answer pair is fine, but distractors are so obviously wrong the answer stands out by elimination. 

distractor quality problem, separate workstream. 

● **good (218)** answer not given away. real knowledge required. no action needed. 

● **prod baseline (general bucket, n=200):** \~2% hard floor (clearly bad only) \-\> \~4–4.5% if including bad \+ distractors-save-it. the 10 distractor-only cases are out of V1 scope.  
● Based on all this we are hoping to start LLM labeling since we now know what types of question to really nail down for a rewrite. 

Enabling diagrams in Hex: Enabling Diagrams in Hex Planning 

● Foundation (Ticket 1, merged): Fixed get\_other\_textual\_card\_side\_label so LOCATION no longer falls through to DEFINITION; extended flashcards and written generators so diagram cards get all intended directions (LOCATION ↔ word/def for flashcards; LOCATION as prompt only for written). 

● MCQ safety (Ticket 2): Custom distractor and ML / studiable-metadata MCQ paths now skip LOCATION answer sides instead of building broken questions (ML distractors don’t support location). 

● Diagram MCQs (Ticket 3): preprocess\_cards includes LOCATION so distance/distractor maps carry pin data; mcq\_fallback\_generator adds WORD→LOCATION and DEFINITION→LOCATION MCQs using in-set pins (MediaDiagramShape / GeoJSON), with stable RNG, deduped distractors, and structlog-style logging where added. 

● Tests & QA: Fixtures for diagram cards, MCQ tests (including insufficient-distractors), full regression; manual checks on diagram vs normal sets; question-lookup-by-ids confirms pins in MCQ options and flashcards for real sets. 

● Contract: Hex returns location pin data only; diagram image remains study-service responsibility (set ID). 

Language feature coverage: 

I was told I need to pull info regarding how we change of ways across languages in features: ● Features to audit: 

○ MCQ quality / distractor generation 

○ Written grading (smart grading) 

○ The ranker 

○ Any other AI/ML features we've shipped (e.g. LLM-generated distractors, MCQ judge) 

● Language breakdown: 

○ English (feature baseline) \- Just learn and smart grading features 

○ Top supported non-English languages (German, French, Spanish, Portuguese) \- what applies here vs. English 

○ All remaining languages \- what the fallback/baseline experience looks like in learn smart grading 

● Maybe break these down by: correctness rates, time on site, subs, age Other: 

Finished cleaning up both v8 and v9 a/b test experiments. 

1\. hex rollout clean-up 

2\. quizlet-web clean-up 

3\. infra clean-up 

Review other PRs, Meetings and planning. 

Learnings: 

Figured out how to test sets in make dev-run by making sets in staging.  
Steps to create staging set ids to test hex endpoint: 

1\. Go to staging.qzlt.io and log in with a staging account 

2\. Create a diagram set specifically — this is the key difference from a regular set: ● Click Create → Study set 

● Look for a Diagram option when adding terms (on production this is under the image/media options when editing a card). If staging web has the diagram set type, select it. 

● Add a diagram image and label a few parts (these become your LOCATION card sides) ● Save the set 

3\. Grab the set ID from the URL: https://staging.qzlt.io/\<something\>/\<SET\_ID\> 4\. Hit your local Hex with it — since make dev-run is already running, go to 

http://localhost:9999/docs and call the question generation endpoint with that set ID ● Defining “answer giveaway” is nuanced.. keyword overlap alone isn’t sufficient; question structure and distractor quality materially affect whether an item is actually solvable without knowledge. 

● Testing needs to mirror real usage.. validating with actual diagram sets (not just fixtures) is critical to catch gaps in distractors, pin handling, and study-mode behavior. How to Improve/Change/iterate/Moving Forward: 

Rewrite: 

● Continue asking questions and trying to nail down what works. Start seeing if we can get an LLM to define eligibility for us next week. 

● Continue with keyword overlap check \+ MCQ judge correlation on the labeled sample Diagrams: 

● Merge the final PR and make sure everything is well for CE teams. 

● Continue asking question\! 

SPRINT 5| Mar 13, 2026 | Deveyn / Jeff 1:1 

Attendees: Deveyn Hainey Jeff James 

What was accomplished: 

Rewrite: LEARN-2246: Learn Rewrite 

● This week mainly focused on creating a dashboard to understand what types of questions need to be targeted for rewrite. 

● MCQ Rewrite Doc Initial Thoughts 

● Found: **V1 Target:** 1.4% of MCQs give away the answer verbatim. User created content has 2.1x higher leakage than AI assisted/generated (1.76% vs 0.83%). **Why this matters:** 74% of Learn sessions are non-creators studying someone else's content, quality issues hit them hardest. User-created sets \= 92% of Learn sessions. ○ **Other quality *issues/things* found (V2+ scope):** 

● SATA/multi-part lists: 5.6% of sata eligibles cards shown as mcqs. 

● Flipped Q/A: \~1-2% of evaluable questions looked like they could be flipped. 

● LLM out-of-set distractors: 4.2pp correctness gap for non-creators vs in-set  
● My plan for next steps is to look at some gemini models for an eligibility model to identify cards where the answer appears on both sides (prompt \+ answer) 

V8 and V9 a/b test clean up: LEARN-2342: Clean up V8 and V9 A/B Tests ● Removed all v8/v9 distractor A/B test logic across hex, quizlet-web, and infra after both experiments concluded with control winning eliminating GrowthBook routing, rollout constants, model version branching, and experiment-specific tests.   
● Cleaned up deployment and infra artifacts, including deleting v8/v9 service configs, ArgoCD applications, image updater sources, and related YAML entries, restoring the default distractor model range (2.60.0–8.0.0) for all users. 

● Pure code and infra cleanup with no intended behavior change; PRs are currently under review, and I’ll monitor v7 distractor APM and remove remaining experimental branches after merge. 

○ THIS STILL NEEDS TO BE MERGED AND APPROVED BY MLP. Work is just done\! 

Enable SATA Questions: LEARN-2335: Turn on SATA questions in HEX ● Monitoring latency of the question generation endpoint here and the ISB endpoint here ● Re-enabled SATA end-to-end in the question generation pipeline for M2, restoring 

InferenceType.SELECT\_ALL\_THAT\_APPLY in ENABLED\_INFERENCE\_TYPES (to fetch SATA predictions from HEX) and re-activating 

QuestionType.SELECT\_ALL\_THAT\_APPLY via generate\_sata\_questions in the QUESTION\_GENERATORS registry. 

● Aligned implementation and tests with the shared generator contract, adding the missing api\_version parameter to generate\_sata\_questions and updating tests to reflect SATA being enabled for both inference retrieval and question generation. 

Look in including Diagrams: LEARN-2336: Support location as a card side in HEX ● Started conversations on the work regarding this.   
● What we know so far: 

○ The location card side (StudiableCardSideLabel.LOCATION) already exists in the Hex data models 

○ The studiables service already includes the location card side in its responses for diagram sets (confirmed by Ian) 

○ MediaDiagramShape is already parsed at the dispatch layer- Hex receives and understands diagram data today 

○ The entire gap is in the question generators, which hard-code (WORD, DEFINITION) and (DEFINITION, WORD) as the only side pairs 

○ Every affected generator file already has a \# TICKET: LEARN-1145 comment marking exactly where diagram support needs to be added 

○ mcq\_generator.py already includes LOCATION in ALL\_ANSWER\_SIDES \- the MCQ orchestration layer is ready, the sub-generators aren't 

○ Files that need changes: flashcard\_generator.py, written\_generator.py, mcq\_fallback\_generator.py, mcq\_custom\_distractor\_generator.py, and 

get\_other\_textual\_card\_side\_label in dispatch/data/studiables/models.py ● If Shane doesn't answer on the async path:  
○ Don't wait on it. The async question is about future-proofing, not about unblocking the current work. The existing sync question generation endpoint is what needs to change per Shane's own confirmation ("it'd just be a change to the existing endpoint's response"). You can make all the generator changes now, and the async path can be addressed as a follow-up once Shane clarifies whether the pubsub payload already carries full card side data or not. It's a separate concern. 

Learnings: 

Quizlet Learn Settings Cheat Sheetstudy\_settings table → setting\_type tells you which setting, setting\_value is a bitmask (add the numbers together)To decode a value: check which bits are on with setting\_value & bit \= bitTo find non-default changers: filter setting\_value \!= defaultValue 

| setting\_type  | What it controls  | Default  | What default means |
| ----- | ----- | ----- | ----- |
| 8  | Learn question types  | 85  | written \+ MCQ \+ flashcard \+ copyAnswer on |
| 13  | Prompt side (Study With)  | 22  | word \+ definition \+ location all on |
| 14  | Answer side (Answer With)  | 22  | word \+ definition \+ location all on |
| 2  | Test question types  | 15  | all 4 types on |

Quick bit decoder for type 8:1\=written, 4\=MCQ, 16\=flashcard, 64\=copyAnswer, 2048\=SATA, 4096\=FITBMultipleChoiceQuick bit decoder for types 13 & 14:2\=word, 4\=definition, 16\=locationReal changers only \= users whose saved value ≠ default value — the rest just have the default persisted or never touched it. 

● Aarons Gemini PR that talks baut how he changes models and also how he added dynamic responseSchema enforcement to eliminate structural output 

errors.https://github.com/quizlet/service-inference-lookup/pull/3628 

How to Improve/Change/iterate/Moving Forward: 

**Rewrite research:**   
● Need labeled eval set for eligibility model training (\~320 cards recommended) ● Run Gemini model experiments (1.5 Flash vs 2.0 Flash Exp vs 2.5 Pro) for answer leakage detection 

● Decide whether to expand V1 scope to include bad distractors or keep strictly focused on answer-in-question 

**Diagram support:**   
● Get async path confirmation from Shane (whether pubsub carries full card side data) ● Don't wait on async answer—make generator changes for sync endpoint first, async can be follow-up 

● Consider eligibility implications: does adding diagrams require new filters?   
**Post-V8/V9 cleanup:**   
● Continue distractor quality investigation—in-set vs out-of-set correctness gap still unresolved ● User research or SME feedback needed to understand what quality dimensions matter most to learners 

SPRINT 5| Mar 6, 2026 

What was accomplished: 

Notes:  
LEARN ONSITE: 

● Connecting with the team 

● Study Alongs 

● Brainstorming 

● Connecting on mcq Rewrite. Feedback for things to consider: 

○ terms that can be question-ifide \- should these be considered? 

○ questions that give answer away \- should be qualified for rewrite 

○ questions with bad distractors \- should these be considered? 

○ Creator vs no creator segmentation \- will this change how user judge the quality of LLM generated content? 

○ look at reach if we want 

○ too early to think about opt-in for UX 

○ look at enterpret feedback too 

○ teacher created vs not 

■ Created a doc that highlights the things we really need to nail down to start this work more clearly MCQ Rewrite Doc Initial Thoughts 

■ **MCQ Rewrite Service: Work Done Summary** 

**Defined V1 Scope Through Data \+ Team Alignment:**   
● Confirmed **answer-given-away as V1 target** (1.4% of MCQs, 2.1×   
higher in user-created content)   
● Established **hard limits**: won't rewrite term-definition pairs, subjective   
questions, quotes/scripts, or cards requiring missing assets   
● Left **bad distractors out of V1 scope** to avoid muddling waters   
**Quantified Production Impact:**   
● 74% of Learn sessions are students studying others' content → quality   
issues hit them hardest   
● User-created sets \= 92% of Learn sessions, where leakage rates are   
highest   
● SATA-eligible cards: 5.6% of catalog, 72% feasible for 1-to-1 rewrite   
(deferred to V2+)   
**Converged on Pipeline Architecture:**   
● **Per-side independent rewrite** (evaluate each study direction   
separately)   
● **Variant 2 recommended**: structural signals \+ card side recs as weak   
input (not driver)   
● Rewrite runs after recs, before distractor generation   
● Enables clean expansion to distractor-informed rewrite later without   
rearchitecting   
**Validated Distractor Hypothesis with Production Data:**   
● LLM out-of-set distractors: 4.2pp lower correctness, 36% slower for   
non-creators   
● Confirms V9 experiment signal: unfamiliar distractors →   
pattern-matching confusion, not knowledge assessment 

● Learn / Core Study Onsite Q1 2026 

● Learned that the eligibility A/B test was trending negatively so we had to stop it. Learnings: 

● Based on the conversations I had in SF about things we should consider I will connect with the team to figure out outcomes  
Feb 27, 2026 

Notes: 

DATA CONFERENCE: 

● Presentations 

● Feb 2026 Quizlet AI and Data Offsite 

Feb 20, 2026 

● Short Week. OOO Monday for Holiday 

What was accomplished: 

MCQ Rewrite 

● Kicked off initial planning for the MCQ Rewrite Service, which aims to identify poorly written Multiple Choice Questions and rewrite them to improve quality without losing educational content. The overarching goal is to maximize the fraction of MCQs in Learn that are rated "Good." 

○ Conducted a manual evaluation as a first pass \- this initial review was scoped down unintentionally, primarily looking at the question and answer without fully considering all relevant signals (distractors, set context, structure, etc.). Because of that, the feasibility labeling from this pass is treated as incomplete, and a more thorough re-review is planned in Phase 2\. 

Rewrite Eval Labeling \- Dont use learned from these for next manual review ● The eval findings opened up broader discussion with Aaron about the right direction: key open questions include whether to support 1-to-1 or 1-to-many rewrites, how to define eligibility (e.g., cards rated NA/Bad by MCQ Judge), and how to measure value (a combination of MCQ Judge \+ a new judge model to detect information loss). ○ Created a v1 research plan (MCQ Rewrite) to align with Aaron, structured around three phases: MCQ Rewrite 

■ **Phase 1 (Data Exploration):** Pulled English card data from Jan 1 – Feb 19, 2026, and found that 5.5% of term/definition pairs qualify for SATA but are currently being served as standard MCQs. Ran the MCQ Judge on a 20k sample of those cards and found 58.9% rated NA or Bad \- making 

them prime rewrite candidates. "Bad" alone accounted for over half the 

sample, confirming the quality problem is significant for cards like this. 

■ **Phase 2 (Qualitative Review):** Planning a manual review of a sample of Bad/NA cards to build a taxonomy of failure modes before writing any 

rewrite prompts. The review will use an updated set of issue flags 

covering: rewrite feasibility, unclear content, poorly written questions, bad distractors, SATA characteristics, need for set context, and rewrite type 

(1:1, 1:1 consolidate, or 1:many).  
■ **Phase 3 (Experiment Design):** Will be shaped by Phases 1 and 2 \- 

includes defining an eligibility model (MCQ Judge BAD/NA threshold), 

establishing baseline quality scores, and running controlled conditions: 

distractor-only rewrite, full question rewrite, and a control group. 

● Currently working on Phase 1 and Phase 2 this week. 

● Set up the tracking epic in Jira: LEARN-2246: Learn Rewrite 

MCQ Scorecard: 

● Created an AI/ML Learn Product Quality Scorecard to consolidate visibility into all quality initiatives happening across the Learn surface into a single, exec-accessible artifact. ● The scorecard tracks features including Smart Grading, Learn Remediation, Distractors V8 and V9, MCQ Judge V2, FITB, SATA, Study Direction, and more: covering current quality scores, suggested targets, evaluation methods, languages supported, and investment notes. 

○ Will be kept regularly updated. The goal is to align with Jeff on what's most important to surface for executive and board-level reporting, with a north star of reaching **95% quality across Learn experiences**. 

● COPY AI/ML Learn Product Quality Scorecard Updated 

Learn Presentation: 

● With the internal data conference coming up next week, began preparing a presentation covering recent Learn ML work, centered around a "Quality Mission" narrative. ● Started the outline here: Learn presenation draft 

● May do a formal presentation OR do a kahoot TBD 

Other: 

● Sprint documentation Generative AI and Study Team Q1 Planning Applied AI ● Read Shane’s doc and how it relates to learn: Quizlet Generative AI Architecture ○ The current Learn question generation system has multiple separate ML services and pipelines that write predictions to Spanner, which are then read later to compose questions \- Shane proposes consolidating all of this (distractors, card side recs, MCQ parsing, SATA) into a single pipeline that generates questions directly and writes them to the Studiables service, eliminating the study domain entirely. This is a longer-term goal that will happen after the Smart Assist/Coach consolidation, since Learn questions are business-critical with low tolerance for quality regression. 

Learnings: 

Aaron’s Distractors v9 Research Summary for changing out models: 

● Distractors v9 Model Refresh 

○ Github branch: 

https://github.com/quizlet/ds-research/tree/aarong/distractors-v9-refresh 

○ The code is in 

ds-research/projects/McqDistractors/src/distractor\_replacement\_research **Qwen3.5-397B-A17B** \- Alibaba’s open-weight vision language model  
● Alibaba’s Qwen **released** Qwen3.5-397B-A17B, an open-weight vision language model featuring a “hybrid architecture” that delivers massive inference gains while rivaling proprietary giants like OpenAI’s GPT-5.2 and Google’s Gemini 3 Pro. 

● Linking here because it could be useful to come back to. 

From the week: 

● The manual MCQ eval revealed that scoping matters evaluating without full context (distractors, set structure, etc.) leads to incomplete feasibility judgments, making a phased qualitative review essential before writing any rewrite prompts. 

● Data exploration confirmed the quality problem is larger than expected: 58.9% of sampled eligible cards rated NA or Bad by MCQ Judge, validating that MCQ Rewrite is a high-leverage initiative worth investing in seriously. 

● The scorecard exercise surfaced how fragmented the quality story has been,  consolidating everything into one artifact made it clear how the workstreams (distractors, grading, remediation, judge) connect and where the gaps are for exec communication. 

How to Improve/Change/iterate/Moving Forward: 

● Complete Phase 2 of the MCQ Rewrite research plan by doing a thorough manual review of Bad/NA cards using the updated taxonomy of failure modes, so rewrite prompts are grounded in real observed issues rather than assumptions. 

● Use the V9 A/B test results (expected \~March 2026\) to inform the eligibility model for rewrite \- understanding which short-answer terms improved with better distractors will help isolate what truly needs a full question rewrite vs. a distractor-only fix. 

● Align with Jeff on a regular scorecard review cadence so the artifact stays current and exec-ready, and use it to prioritize which quality initiatives get the most investment heading into Q2. 

● Shape the data conference presentation feedback loop, whether it's a slide deck or Kahoot, use the audience's reactions and questions to pressure-test the "quality flywheel" narrative and refine how the team tells this story going forward. 

Feb 13, 2026 

● Short Week. OOO Feb 5 \- 10 

What was accomplished: 

Notes: 

Learn Eligibility: 

● Need to update Page: ML Project Page \- MCQ Distractors Service when we get the a/b test done and if we decide to roll out.   
● Launched the eligibility experiment, ran into some bumps so had to fix those. ○ We needed to remove a character limit and update the version to see the results. Specifically what happened was Heidi mentioned that some distractors (ones where an answer was less than 3 characters where receiving bad distractors.  
Thread) We decided to add this into our experiment, but when i did i rebased incorrectly causing our word eligibility changes in the experimental branch to disappear. So we had to also read those back in. Once we did that we still noticed the character changes were not implemented correctly so we also had to push a version bump to refresh the docker image. Everything is now working as expected. 

■ Eligibility AB test Steps 

■ Monitoring 

● Started talking and learning about the MCQ rewrite work 

● Need to look at Shane's doc: Quizlet Agentic Architecture 

Reviews: 

● Started writing reviews, for myself, peers, and manager 

**LLM Eligibility Expansion \- v9 Changes Summary**   
**Changes Implemented:** 

● Removed minimum character limit: Changed min\_key\_chars from 3 → 1, allowing 1-character answers like "B", "5", "X" to pass general eligibility 

● Removed word minimum for English: Eliminated the 5-word requirement for English (en-en) terms in LLM eligibility checks 

● Non-English preserved: Non-English languages still require 5+ words (or numbers) for LLM generation to maintain quality 

● Version bump: Set to 9.0.0 for v9 A/B test deployment 

**Impact on en-en Distractors:** 

● Before: Only terms with 5+ words or numbers got LLM generation 

● After: ALL 1+ character English terms get LLM generation (excluding MCQs, terms with newlines, keys \>260 chars, wrong side recommendations) 

● Coverage: Expands LLM usage to 100% of eligible en-en distractors **Version Isolation:** 

● v9 only serves en-en sets through GrowthBook routing logic 

● v7 (control) and v8 (separate experiment) are unaffected 

● Only users enrolled in v9 experiment receive these changes 

**Important Note:**   
If this were launched without the v9 routing logic: 

● ⚠️ min\_key\_chars=1 would affect ALL languages (language-agnostic general eligibility filter) 

● ✅ MIN\_WORDS removal would still only affect English (language-specific check in LLM generator: if term\_features\["word\_language"\] \== "en") 

Good learning to dos: 

● How to better use Cluade Code 

Article:https://boristane.com/blog/how-i-use-claude-code/?utm\_source=tldrnewsletter Learnings: 

● When dealing with code thats going into an experimental branch you only need to care about that version not about others. Pr for context. 

○ Why We Don't Need Version Logic  
■ Each version runs its own separate codebase, not the same code with different configurations. 

■ When you deploy v7, v8, or v9, each version is a separate deployment running from its own git branch: 

● v7 runs from the main/v7 branch with min\_key\_chars=3 

● v8 runs from a v8 experimental branch with min\_key\_chars=3 

● v9 runs from our v9 experimental branch with min\_key\_chars=1 

■ They're not the same service checking "what version am I?", they're completely separate services running different code. When you change 

min\_key\_chars from 3 to 1 on the v9 experimental branch, only v9 sees that change \- v7 and v8 continue running their own unchanged code. 

This is why the single line change (min\_key\_chars=3 → min\_key\_chars=1) is all you need\! ● Smart Assist V2/V3 Flashcard Generation Model Switch | Create & Study | ML \- Smart assist eval helpful to see set-up for future evals from different teams ● Sometimes you need to trigger a version pump to trigger a new docker image to refresh to see changes on an experimental branch. 

How to Improve/Change/iterate/Moving Forward: 

● Continue documenting problems and solutions. Really helps to have something to go back to and learn from. 

● Debugging is part of the experience. Things will not work perfectly and its okay. ● Communicate, communicate\!\! 

Feb 4, 2026 

● Short Week. OOO Feb 5 \- 10 

What was accomplished: 

Notes: 

Learn Min Eligibility: 

● Tested Web changes on GitPods   
○ Was a little bit of a pain because of how finicky they are \- first page loads take literal minutes, and needed to restart HHVM/renderer multiple times 

○ Needed to do this to test the routing logic for the v8 vs v9 tests were working correctly 

○ Testing approach:   
■ Used URL parameter overrides   
(?\_\_overrideABs=DistractorsV9MinEligibility-experiment) to toggle   
between variants   
■ Added debug logging to LearnAdminCenter.tsx and piped   
debugRoutingInfo through the API response to verify which path was   
being hit   
■ Verified English (en/en) sets route to v9 when in experiment group   
■ Verified non-English (de/de) sets are unaffected by the V9 flag and   
correctly use the V8 NonEn flag instead 

○ Page: V9 AB Test Routing Verification documented all findings including routing tables, debug code changes, and troubleshooting steps   
● Unit tests for inference PRs   
○ Ran hhvm vendor/bin/hacktest tests/ml/Hex/MLDataProviderTest.php  
○ All tests passing for: successful version serving (off, control, experiment), PENDING status handling, GrowthBook enrollment tracking 

● Updated GrowthBook feature flags   
○ DistractorsV9MinEligibility — set to serve 0% traffic (experiment in draft/stopped state) 

○ DistractorsV9MinEligibility\_rollout — set override rules to 100% → "off" for both service-dev and service-prod 

○ Fixed feature flag name typo in MLDataProvider.php (was   
DistractorsV9EnEligibility, changed to DistractorsV9MinEligibility)   
● Started merging PRs, ran into ArgoCD issue   
○ Merged staging infra PR last week   
○ Merged production infra PR and then the feature → experimental branch ○ ArgoCD not deploying as expected \- investigating sync status and image-updater logs (slack) 

■ Trying to figure that out now   
● Updated rollout PR   
○ Added logic to check both v8 and v9 rollout flags   
○ Ensures v8 NonEn and v9 En experiments can co-exist without conflicts Folders Logging: 

● Continued with logging, specifically Native (iOS/Android)   
○ Set up Confluence page documenting expected events and verification status ○ Started checking events in BigQuery 

○ Comparing native event schemas against web implementation for consistency ○ Page: Folders Documentation of Logging 

○ Folders logging 

Learnings: 

How to run unit tests for distractors 

Python 

`# Navigate to the distractors service directory` 

`cd /opt/projects/service-inference-lookup/services/distractors` 

`# Set PYTHONPATH` 

`export PYTHONPATH=/opt/projects/service-inference-lookup:$PYTHONPATH` 

`# Run with pipenv (which has pytest installed)` 

`pipenv run pytest -s -vv tests/test_generators.py::test_openai_generate` 

\-s flag (show output) 

Without \-s: pytest captures all print statements and output (you don't see them) With \-s: You see all print statements, debug logs, and output in real-time Useful for debugging or seeing what's happening 

\-vv flag (very verbose) 

Without \-vv: Shows minimal output (just pass/fail summary) 

With \-v: Shows each test name as it runs 

With \-vv: Shows even more detail (parameter values, full test names)  
Testing in gitpod 

Python 

`Run the entire test file:`  


 `yarn test:hhvm tests/ml/Hex/MLDataProviderTest.php --no-watch`  


 `Or to run just the v9 tests specifically, use phpunit directly:`    

 `qhhvm-cli --no-config --config=/workspace/quizlet-web/tooling/phpunit/php.ini /workspace/quizlet-web/vendor/composer/bin/phpunit` 

`--configuration=/workspace/quizlet-web/tests/general/config.xml`  

 `tests/ml/Hex/MLDataProviderTest.php --filter 'testEnV9Distractor'` 

● GitPod debugging requires a different approach than local development \- backend logs (like error\_log() in PHP) don't show up in GitPod terminals, so you need to pipe debug info through the API response and log it on the frontend instead. URL parameter overrides (?\_\_overrideABs=FlagName-variant) are the fastest way to test A/B routing without waiting for GrowthBook approval cycles. 

● Feature flag naming must be exact across all systems \- a single typo between the GrowthBook flag name and the code reference (e.g., DistractorsV9EnEligibility vs DistractorsV9MinEligibility) will silently fail routing without obvious errors. Always verify the flag name in GrowthBook matches exactly what's in the codebase before testing. How to Improve/Change/iterate/Moving Forward: 

● For gitpods the debug info pipeline (piping debugRoutingInfo through the API to frontend console logs) was essential for verifying routing. I documented this pattern so when I need to do something similar for future A/B tests I have something to look at. 

● Before opening PRs that reference GrowthBook flags, verify the exact flag name exists in GrowthBook and matches character-for-character. Could add a simple grep/search step to the PR template or CI to catch mismatches early. 

● Investigate ArgoCD deployment patterns \- The current issue is blocking progress. Once resolved, I hope to document what went wrong and the fix so future ML service deployments go smoother for me. 

● Document document document. There's a lot of steps and it's helpful to know what you did once you're done, so document them\!\!

# **Tickets**

Tickets  
gsk\_OqRgyUPAyfnRPj3zgimMWGdyb3FY8CAfMShSOLxAWSdxkElfOVPO 

Priority of these tickets lets figure it out\!\! 

LEARN-2617: Web | User doesn't get prompted to answer written questions with both ter… ● The suggestion was to leave a comment asking Sam or Michael directly: do they want parity with KMP (leave it as is) or do they want the bug actually fixed (which would 

intentionally break parity)? Let them make the call before doing any work. ● **Closed \- Wont Do \- Will come back to** 

Jeff LEARN-2688: Web| Multiple-choice questions displaying duplicate correct options ● This one was considered more actionable since you already had a partial fix via the Sata bump (deduplication check at creation time that drops the duplicate distractor). ● The suggestion was to **size** how often it actually occurs with a query, post that data on the ticket, and determine if the existing fix covers it 

○ Occurred 0.49% in last 180 days 

**● Closed this one for now** 

Jeff LEARN-1287: UGC MCQs fail to parse when missing tags and including unlabeled ex… ● The parser hit an edge case it couldn't handle.   
● The feeling was this is a relatively small fix, probably adding another regex pattern or parse handler, but since the team isn't actively iterating on distractors right now, the suggestion was to defer it and comment that it'll be picked up during the next distractor research pass. 

○ Could also see how often this occurs 

Deveyn LEARN-2307: Web | The correct answer in Multiple-choice questions is obvious ● A user reported that the correct answer was obvious because all other options were much longer, making the single-word answer stand out. This is a known weakness in the distractor quality model. The suggestion was to close it with a comment noting it's a known limitation that will be addressed in the next full distractor research iteration, and point to the existing eval results. 

**● Responded with couldn’t reproduce** 

**○ Closed with could not reproduce** 

LEARN-2460: Web | Learn Written question answered by Hebrew Language is being mar… ● Doesn’t happen on either flow   
● **Responded with couldn’t repoduce** 

**○ Closed with could not reproduce** 

LEARN-2498: Web | Multiple choice option adds word in different language ● "often confused" generation path,this path pulls from real terms within the user's set that have historically been confused with the correct answer, so if a user's set contains mixed-language content, the distractors will reflect that.  
● This is the system working as intended given the input data. The unusual output here is a reflection of the user's set content rather than a bug in the distractor generation logic. ● Closing this out.. if we see this pattern coming from a different generation path (e.g. LLM distractors), that would warrant a separate investigation. 

**● Havent responded** 

Epic: LEARN-189: Miscellaneous MCQ bugs and feature requests 

Jeff LEARN-1642: Distractors referencing MCQ tags (e.g. "Both A and B") should be exclu… **● This is closed but is still occuring**   
**If i come back to remember to look at this more closely** 

**https://gist.github.com/deveynhainey-qz/2f8a9fea34abf28452c4e2bbc7b9ce23** The suggestion was to defer to the next distractor iteration rather than investigate now. (apart of often confused) 

{ 

 "questions": \[ 

 { 

 "content": { 

 "hintMedia": null, 

 "options": \[ 

 { 

 "correct": true, 

 "explanationMedia": \[\], 

 "optionId": "1", 

 "optionMedia": \[ 

 { 

 "languageCode": "string", 

 "plainText": "DUI", 

 "richText": null, 

 "type": "1" 

 } 

 \] 

 }, 

 { 

 "correct": false, 

 "explanationMedia": \[\], 

 "optionId": "2", 

 "optionMedia": \[ 

 { 

 "languageCode": "string", 

 "plainText": "ALL OF THE ANSWERS",  
 "richText": null, 

 "type": "1" 

 } 

 \] 

 }, 

 { 

 "correct": false, 

 "explanationMedia": \[\], 

 "optionId": "3", 

 "optionMedia": \[ 

 { 

 "languageCode": "string", 

 "plainText": "BAC", 

 "richText": null, 

 "type": "1" 

 } 

 \] 

 }, 

 { 

 "correct": false, 

 "explanationMedia": \[\], 

 "optionId": "4", 

 "optionMedia": \[ 

 { 

 "languageCode": "string", 

 "plainText": "DWI", 

 "richText": null, 

 "type": "1" 

 } 

 \] 

 } 

 \], 

 "promptMedia": \[ 

 { 

 "languageCode": "string", 

 "plainText": "Driving Under the Influence; operating a vehicle while impaired by alcohol or drugs.", 

 "richText": null, 

 "type": "1" 

 }  
 \], 

 "questionType": "MultipleChoice",  "shouldShuffleOptions": true 

 }, 

 "id": "19b7c8be8d83c324908708ae8b73d4bb",  "questionDirection": { 

 "answerSides": \[ 

 "word" 

 \], 

 "promptSides": \[ 

 "definition" 

 \] 

 }, 

 "questionMetadata": { 

 "cardSideRecommendationRank": 1,  "generationSource": "distractor", 

 "optionGenerationSource": \[ 

 "key", 

 "often\_confused\_mcq|user\_defined",  "often\_confused\_mcq", 

 "often\_confused\_mcq" 

 \], 

 "questionStudiableMetadata": { 

 "notReadyForContainer": \[\], 

 "presentForItem": \[ 

 5, 

 4 

 \], 

 "readyForContainer": \[ 

 4, 

 5 

 \], 

 "staleForItem": \[\], 

 "unavailableForContainer": \[ 

 6, 

 9 

 \] 

 }, 

 "studiableMetadataVersions": { 

 "4": "7.1.16",  
 "5": "5.0.59", 

 "6": "1.0.93", 

 "9": "1.0.106" 

 } 

 }, 

 "questionType": "MultipleChoice",  "studiableContainerId": "1182944207",  "studiableContainerType": 1, 

 "studiableItemId": "1865826157273096",  "studiableItemType": 2 

 } 

 \] 

}

# **Tab 4**

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,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>

[image4]: <data:image/png;base64,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>

[image5]: <data:image/png;base64,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>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAXUAAAC2CAYAAAAm9h1mAABQy0lEQVR4Xu3d6bcVRbbv/fv/njvGeeq+qDPOOVWWZQNI3yqggiA2oICgoKBIowiCDSh2KNhhb5VtvV5PfmLt3zJ3sugsFdlOxviOzcomMiIyc0bknDPm/D//p/v3r3/9a1QURVHc+JDpE6H+/fffj/bv3z965513GsODr8RXX389evbZg6MPPvig8fHHH7dyvvzyy8Zbb789Onfu3GjPnr0N25588snR559/3jh85MjorbfeGp1+7bXRsWPHGur0/NGjozfefLNx5syZi65bFEVRjCmhXhRFMYeYJdQJ9Lc7IXzfpk0NwvTkyZOjV0+dajz44IOjI889N9qxY2fj+PHjnRB/dvTGG280vv7HP0YvvvjiaOvWrY1tjzwy2r59++iee+5pPPTQQ6MNGzeOXnnl1cZzXVkvvPDCaPuOHY2dOx9r13DcQw8/3Ni27ZHRAw88OHq7GxDw7rvvXtSIoiiKYswsof7444+PPvnkk9GWLQ80tm7dNtq1a9fozrvuahDS99x77+j8+fONlStXNqH+Y3culPHtt9+N5s2fP+HRRx8dPf30042bb7559Prrr0+EuFn60W7gcB08/vgTo4c7Qf7ww+NBARvvu290vBsoTnSDC4YNKIqiKH5illD/RzfTNrNetWpVg/rDzJlKBNu372gz8ahT7usErr+ZqSuD2oWKBWb9Bw8e6gT9t419+/aNXnrppXYNvH7mTBP6Z8+ebTzxxBOjF0+caDN4Xw2w3THqhmEDiqIoip8ooV4URTGHmCXUw48//tgYbg/fffdd40QngIf7iqIoiuvHLKH+0ccfjx555JHmYXK1XiYvvfzyxHtluK8oiqL4bZkl1I++8MJox44do1OnTjXuv//+0Z49e0a7du9uMG4yXOb3lgceGG3avHni3XL48OHR5s33j/Y++WRj2fLlo5dfeeWiixZFURS/DiXUi6Io5hCzhPqrr77aDKIxlN56663NzXHtunWNJUuWNB9yhkt89NFHo63btk18yJ2zZOnSdg64Q37zzTcXXbQoiqL4dZgl1L/66qvmOx4/dD7k/Mp5owTC+4svvmg8tW/f6J13zrbzYGHQswcPTrxl3nvvvfZ3eNGiKIri12GWUC+KoihubEqoF0VRzCEuK9T5oucv+K7n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>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACMCAYAAADGFpQvAABERUlEQVR4Xu3d55NexZU/8P17trbKVfv298q1L3ar/MKLwdgGm2SbZJLJWSQTTUZEgUxOQiKYjBAm55yDBCbDkg2TdX98+uH76HKZeWakGYEG9bfq1MxzQ/fp06dP9z3n3L7/1lRUVFTME/xb90BFRUXFhopqsCoqKuYNpjVYExMTzdjYWKHvA6tXry40G+A5BCkz5Y6Pj3+nnu41a4PZ3FtRUTFzDDRYH3zwQXPUUUc1J598cqElS5Z0L5lzvPjii80rr7zSPbxWOOaYY5rHH3+8EJx33nnNv/71r0KXXHJJc/rppzdHHnlkoXfeeadc8/DDDxd67LHH2kXNCIsXL26Gh4cLVVRUrD8MNFjPPfdcc/zxxzevv/56oaeeeqq54447mvfff7/Q3//+9+b5558vBgIdffTRzbnnntuceuqphR555JHmpJNOao477rhCZ555ZnPhhRc2Tz75ZKGzzjqrnGek0GGHHdZcdNFFzTPPPFOMAFq4cGGp4+KLLy6kjKeffrrP46efftqvDz3xxBPNTjvt1Lz55puFwPGVK1cW8j98+OGHhVatWlV+33fffYUeeOCBfr1IXeodHR0tdPnllzfXXXddc/bZZxdasWJFn0d0xhlnFANZV1wVFXOParCqwaqomDcYaLC+/PLLYqQWLVpUiFG64oormn/+85+FLrjggmKUrr766kIGMmNz2mmnFbrllluaBx98sAxi9NlnnzUnnnhi32B5PNt+++3LNeimm25q7r333uaaa65pdt9990KMRx5JEYP10ksv9XlkNJX18ssvF7rqqquaU045pdWKnsHCF2IwIQbok08+Kb9jsJYtW9bstttufYPJoHqEvPPOOwstX7682WGHHfoG9MADDywG69FHHy3E6Hp0rgaromLuMdBgMR5WEYwWOuSQQ5prr722ufXWWwvtt99+xWBdf/31hW644YZiNGKgGCwrHkYGDQ0NFaNj1Yac23XXXfvG4q677ip13nbbbcV3htR74403lpUX+sc//lFWZgG/02WXXdYsXbq0EIMymcGyEkMHHXRQMVwxwuqE8HD77bcX35aVFWIQ/d12220LacOCBQuK0USXXnppMVh33313Ifzvu+++zVdffVWooqJi7jDQYFkhMCoMD/q///u/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WO5DXq6+4447irCQbW10zimnnFIID8rOZ8oJdKuttmouueSSQq51z4MPPljooYceKhsVRrGcayv7ihUrCk8pTxuWLFlSdqFA5OM8o4iWL19e5PbRRx8VUt5+++3XL+/1118v199zzz2FfAadXLNFD16UnxfObYjoGvWkL/CdT6jfddddze67716OZ2LQflv72DwRKQdvkbs6yNXn10Pvv/9+n4eXXnqp39fIvY67B5GxPslL8MrEc3DGGWc0PhX/8ssvF8IvPt2D3nnnndIXv/3tbwu9+uqrRSbPP/98IfzYBSQyZpBcn40g77777nL8scceK7Tddts1//jHP/rX6wM8Rq+eeuqpwpd255qVK1cW+UXO2qwdJ5xwQiF44IEH+tebvOmX/kDk0TYI+HJ/2kzu+Ige33zzzUUu6kH0yjV0HdE996dNoJ5sHKBM1ygTkRGZZFxoi/Fk8kKLFi0q9/iL6LmtoNIHdNNxskS33nprKS+P3yZCv6+88soiB6TNtou64oorCm277bZl84PvE9VgVYNVDVY1WD8ug5X9sDbbbLNm77337gvBZn4683e/+10he2K198OCZcuW9RsIp556anPSSScVOvDAA5sFCxY01157bSH7aanPFja2skHOU3jb3KBdd9212X777Zudd965EB4o2PHHH18IX4yjAYsYLNveHHvssYUMHIMpmwoeffTRzTHHHNPssccehbTH+YDC20ZHh6MvvviiKG7acPDBB5dj6kD2C6NoW2+9dSFG27HguOOOK9erF7mfwqgT4Z2BS3td4/q0D9RjwCFtN7hhxx13LIQ/12bAql85jBIycPRTiJwPPfTQPg940td77bVXIf1hq6DIUJ8YNPoLGUiuCQwMBiP9ihfbD8Xo+h/P7kEGM7nnd7YqyqSkn3baaafS78g1b7/9dt9o499fuon0C2Og3xAdBBtQRq5kZOCmH+iAR7XoHTAK5IJOPvnkMh522GGHQvSOIQmUyfDEYOiXP/3pT/3y8PzII4+UckLKT/3uN1HGQDIaW2yxRV8mt99+e/Nf//Vf/cdy1xtT0Vt10J1DDjmkkA02/c7WT+TgeAyuPrbYYMxR+vvFF18sZHNOuoEH+oNMTvo+eqVfNyiDZXYlLLMnojgU6YMPPij0i1/8oswyUVznGKT2flg/+9nPvrUfFkXPLLZ48eJyfWZOHa0j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>