# Parameter Extraction Strategy Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current single-pass, first-15k-character LLM extraction with a chunked, evidence-backed, retryable pipeline that is stable on long papers and multiple template types.

**Architecture:** The backend will gain an asynchronous extraction job flow with three new layers: structural chunking, per-chunk candidate extraction, and global aggregation/verification. Existing paper parsing stays in place, existing parameter/version tables remain the final storage layer, and the new job/chunk/candidate records capture the intermediate evidence chain.

**Tech Stack:** TypeScript, Express, Prisma, PostgreSQL, Anthropic SDK, existing PDF/DOCX/Markdown parsers.

---

### Task 1: Add extraction job data model

**Files:**
- Modify: `backend/prisma/schema.prisma:1-123`
- Modify: `backend/src/index.ts` if Prisma client types or seeding paths need a refresh
- Test: `backend/prisma/schema.prisma` migration validation via Prisma generate/migrate

- [ ] **Step 1: Write the failing schema expectation**

Add the following models and relations to `backend/prisma/schema.prisma`:

```prisma
model ExtractionJob {
  id            String   @id @default(uuid())
  paperId       String   @map("paper_id")
  templateId    String   @map("template_id")
  status        String   @default("queued")
  currentStage  String?  @map("current_stage")
  totalChunks   Int      @default(0) @map("total_chunks")
  completedChunks Int    @default(0) @map("completed_chunks")
  errorMessage  String?  @map("error_message")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  paper   Paper   @relation(fields: [paperId], references: [id])
  template Template @relation(fields: [templateId], references: [id])
  chunks  ExtractionChunk[]

  @@map("extraction_jobs")
}

model ExtractionChunk {
  id          String   @id @default(uuid())
  jobId       String   @map("job_id")
  chunkIndex  Int      @map("chunk_index")
  sectionPath String?  @map("section_path")
  startOffset Int      @map("start_offset")
  endOffset   Int      @map("end_offset")
  chunkType   String   @map("chunk_type")
  status      String   @default("queued")
  inputText   String   @map("input_text")
  rawOutput   Json?    @map("raw_output")
  errorMessage String? @map("error_message")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  job         ExtractionJob @relation(fields: [jobId], references: [id], onDelete: Cascade)
  candidates  ExtractionCandidate[]

  @@unique([jobId, chunkIndex])
  @@map("extraction_chunks")
}

model ExtractionCandidate {
  id              String   @id @default(uuid())
  chunkId         String   @map("chunk_id")
  fieldName       String   @map("field_name")
  candidateValue  Json     @map("candidate_value")
  normalizedValue Json?    @map("normalized_value")
  evidenceText    String   @map("evidence_text")
  evidenceStart   Int      @map("evidence_start")
  evidenceEnd     Int      @map("evidence_end")
  confidence      Float
  status          String   @default("uncertain")
  decisionSource  String?  @map("decision_source")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  chunk ExtractionChunk @relation(fields: [chunkId], references: [id], onDelete: Cascade)

  @@map("extraction_candidates")
}
```

- [ ] **Step 2: Run schema generation and verify the Prisma client updates**

Run:
```bash
cd backend
npx prisma generate
```
Expected: Prisma client regenerates successfully and the new models appear in generated types.

- [ ] **Step 3: Create the migration**

Run:
```bash
cd backend
npx prisma migrate dev --name add_extraction_pipeline_models
```
Expected: migration creates the three new tables without altering existing parameter history tables.

- [ ] **Step 4: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations

git commit -m "feat: add extraction job persistence"
```

---

### Task 2: Extract chunking and candidate types into backend helpers

**Files:**
- Create: `backend/src/services/extraction/types.ts`
- Create: `backend/src/services/extraction/chunker.ts`
- Create: `backend/src/services/extraction/normalize.ts`
- Test: `backend/src/services/extraction/chunker.test.ts`
- Test: `backend/src/services/extraction/normalize.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `backend/src/services/extraction/chunker.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { chunkPaperText } from './chunker.js'

describe('chunkPaperText', () => {
  it('prefers section boundaries over raw length', () => {
    const text = '# Abstract\nA.\n# Methods\nB.\n# Results\nC.'
    const chunks = chunkPaperText(text, { maxChunkChars: 20 })
    expect(chunks.some(c => c.sectionPath === 'Methods')).toBe(true)
  })

  it('keeps table-like content in a separate chunk', () => {
    const text = 'Table 1\nA | B | C\n1 | 2 | 3\n\nMethods\nDone.'
    const chunks = chunkPaperText(text, { maxChunkChars: 20 })
    expect(chunks.some(c => c.chunkType === 'table')).toBe(true)
  })
})
```

Create `backend/src/services/extraction/normalize.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { normalizeCandidateValue } from './normalize.js'

describe('normalizeCandidateValue', () => {
  it('normalizes scientific notation numbers', () => {
    expect(normalizeCandidateValue('3e-5')).toBe('0.00003')
  })

  it('preserves non-numeric strings', () => {
    expect(normalizeCandidateValue('Pd/C')).toBe('Pd/C')
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:
```bash
cd backend
npm test -- chunker.test.ts normalize.test.ts
```
Expected: fail because the new helpers do not exist yet.

- [ ] **Step 3: Implement the minimal helpers**

Create `backend/src/services/extraction/types.ts`:

```ts
export type ChunkType = 'text' | 'table' | 'figure_caption' | 'appendix'

export interface ExtractionChunkInput {
  chunkId: string
  paperId: string
  sectionPath: string
  startOffset: number
  endOffset: number
  chunkType: ChunkType
  text: string
}

export interface ChunkCandidate {
  field: string
  value: string | number | boolean | null
  normalizedValue?: string | number | boolean | null
  evidence: string
  evidenceStart: number
  evidenceEnd: number
  confidence: number
  status: 'confirmed' | 'uncertain' | 'not_found'
}

export interface ChunkExtractionResult {
  chunkId: string
  candidates: ChunkCandidate[]
}
```

Create `backend/src/services/extraction/normalize.ts`:

```ts
export function normalizeCandidateValue(value: unknown): unknown {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (/^-?\d+(?:\.\d+)?e-\d+$/i.test(trimmed)) {
      return String(Number(trimmed))
    }
    return trimmed
  }
  return value
}
```

Create `backend/src/services/extraction/chunker.ts`:

```ts
import type { ExtractionChunkInput } from './types.js'

export function chunkPaperText(text: string, opts: { maxChunkChars: number }): ExtractionChunkInput[] {
  const sections = text.split(/\n(?=#{1,6}\s)/)
  const chunks: ExtractionChunkInput[] = []
  let index = 0

  for (const section of sections) {
    const sectionPathMatch = section.match(/^#{1,6}\s+(.+)$/m)
    const sectionPath = sectionPathMatch?.[1]?.trim() || 'Unknown'
    const chunkType = /table/i.test(section) ? 'table' : /figure/i.test(section) ? 'figure_caption' : 'text'
    const content = section.trim()

    if (!content) continue

    if (content.length <= opts.maxChunkChars) {
      chunks.push({
        chunkId: `chunk-${index++}`,
        paperId: '',
        sectionPath,
        startOffset: 0,
        endOffset: content.length,
        chunkType,
        text: content,
      })
      continue
    }

    for (let offset = 0; offset < content.length; offset += opts.maxChunkChars) {
      const slice = content.slice(offset, offset + opts.maxChunkChars)
      chunks.push({
        chunkId: `chunk-${index++}`,
        paperId: '',
        sectionPath,
        startOffset: offset,
        endOffset: offset + slice.length,
        chunkType,
        text: slice,
      })
    }
  }

  return chunks
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run:
```bash
cd backend
npm test -- chunker.test.ts normalize.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/extraction/types.ts backend/src/services/extraction/chunker.ts backend/src/services/extraction/normalize.ts backend/src/services/extraction/chunker.test.ts backend/src/services/extraction/normalize.test.ts
git commit -m "feat: add extraction chunking helpers"
```

---

### Task 3: Redesign the AI extraction service for chunk-level candidates

**Files:**
- Modify: `backend/src/services/ai.ts:1-135`
- Test: `backend/src/services/ai.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `backend/src/services/ai.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { mergeCandidateFields, selectBestCandidate } from './extraction/aggregation.js'

describe('selectBestCandidate', () => {
  it('prefers explicit evidence over weaker evidence', () => {
    const winner = selectBestCandidate([
      { value: '3e-5', evidence: 'We set lr to 3e-5', confidence: 0.7, sectionPath: 'Methods' },
      { value: '0.00003', evidence: 'training was stable', confidence: 0.8, sectionPath: 'Results' },
    ])
    expect(winner.value).toBe('3e-5')
  })
})

describe('mergeCandidateFields', () => {
  it('keeps conflicting candidates when values disagree', () => {
    const merged = mergeCandidateFields([
      { field: 'lr', value: '3e-5', normalizedValue: '0.00003', evidence: 'a', confidence: 0.9 },
      { field: 'lr', value: '5e-5', normalizedValue: '0.00005', evidence: 'b', confidence: 0.8 },
    ])
    expect(merged.conflicts.lr.length).toBe(2)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:
```bash
cd backend
npm test -- ai.test.ts
```
Expected: fail because the aggregation helpers do not exist yet.

- [ ] **Step 3: Implement the new extraction entry points**

Add the following to `backend/src/services/ai.ts` and preserve `naturalLanguageQuery`:

```ts
import type { ChunkExtractionResult, ChunkCandidate } from './extraction/types.js'
import { normalizeCandidateValue } from './extraction/normalize.js'

export async function extractChunkCandidates(
  paperText: string,
  templateYaml: string,
  sectionPath: string,
): Promise<ChunkExtractionResult> {
  if (!client) {
    return { chunkId: sectionPath, candidates: [] }
  }

  const templateObj = YAML.parse(templateYaml)
  const fields = flattenKeys(templateObj)

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1400,
    system: `你是一个科研参数抽取助手。只针对当前片段抽取候选值、证据、置信度，不要输出最终结论。必须返回 JSON。字段列表：${fields.join(', ')}`,
    messages: [{
      role: 'user',
      content: `片段标题：${sectionPath}\n\n片段内容：\n${paperText}`,
    }],
  })

  const textBlock = response.content.find((c): c is Anthropic.TextBlock => c.type === 'text')
  if (!textBlock) {
    return { chunkId: sectionPath, candidates: [] }
  }

  const jsonMatch = textBlock.text.trim().match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return { chunkId: sectionPath, candidates: [] }
  }

  const parsed = JSON.parse(jsonMatch[0]) as { candidates?: ChunkCandidate[] }
  const candidates = (parsed.candidates || []).map(candidate => ({
    ...candidate,
    normalizedValue: normalizeCandidateValue(candidate.normalizedValue ?? candidate.value) as any,
  }))

  return { chunkId: sectionPath, candidates }
}
```

Also add `backend/src/services/extraction/aggregation.ts` with the logic needed by the tests and later pipeline stages.

- [ ] **Step 4: Run the tests to verify they pass**

Run:
```bash
cd backend
npm test -- ai.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/ai.ts backend/src/services/extraction/aggregation.ts backend/src/services/ai.test.ts
git commit -m "feat: extract chunk-level parameter candidates"
```

---

### Task 4: Implement job orchestration for parsing, chunking, extraction, aggregation, and review

**Files:**
- Modify: `backend/src/routes/papers.ts:68-151`
- Modify: `backend/src/routes/parameters.ts:63-249`
- Create: `backend/src/services/extraction/jobRunner.ts`
- Create: `backend/src/routes/extraction.ts`
- Test: `backend/src/routes/extraction.test.ts`

- [ ] **Step 1: Write the failing route tests**

Create `backend/src/routes/extraction.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

describe('extraction job route', () => {
  it('creates an extraction job and returns a job id', async () => {
    // request against POST /extraction/jobs should return 201 and jobId
  })

  it('returns job progress for existing job', async () => {
    // request against GET /extraction/jobs/:id should include stage, counts, and status
  })
})
```

- [ ] **Step 2: Run the route tests and confirm they fail**

Run:
```bash
cd backend
npm test -- extraction.test.ts
```
Expected: fail because the route does not exist yet.

- [ ] **Step 3: Implement the job runner and routes**

Create `backend/src/services/extraction/jobRunner.ts` to:
- load a paper and template
- build chunks with `chunkPaperText`
- write `ExtractionJob` and `ExtractionChunk` rows
- call `extractChunkCandidates` per chunk
- aggregate candidate records
- compute final status
- mark jobs as `needs_review` or `completed`

Create `backend/src/routes/extraction.ts` with endpoints such as:
- `POST /extraction/jobs`
- `GET /extraction/jobs/:id`
- `GET /extraction/jobs/:id/chunks`
- `POST /extraction/jobs/:id/retry`

Update `backend/src/routes/papers.ts` to enqueue a job instead of directly calling `parsePaper()` for extraction flows.

Update `backend/src/routes/parameters.ts` so the extraction endpoint becomes a thin compatibility wrapper or is replaced by the job-based entry point, while review endpoints continue to operate on final `parameters` records.

- [ ] **Step 4: Run the route tests to verify pass**

Run:
```bash
cd backend
npm test -- extraction.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/papers.ts backend/src/routes/parameters.ts backend/src/routes/extraction.ts backend/src/services/extraction/jobRunner.ts backend/src/routes/extraction.test.ts
git commit -m "feat: add asynchronous extraction job flow"
```

---

### Task 5: Expose evidence-backed review data in the frontend

**Files:**
- Modify: `frontend/src/pages/PaperDetail.tsx`
- Modify: `frontend/src/pages/Papers.tsx` if job status is shown in the list
- Create: `frontend/src/api/extraction.ts`
- Test: `frontend/src/pages/PaperDetail.test.tsx`

- [ ] **Step 1: Write the failing UI test**

Create `frontend/src/pages/PaperDetail.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import PaperDetail from './PaperDetail'

test('shows extraction evidence sections when a parameter has candidates', () => {
  render(<PaperDetail />)
  expect(screen.getByText(/证据/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the UI test and confirm it fails**

Run:
```bash
cd frontend
npm test -- PaperDetail.test.tsx
```
Expected: fail because the evidence UI does not exist yet.

- [ ] **Step 3: Implement the minimal frontend changes**

Add API helpers to fetch extraction jobs and candidate evidence.

Update `PaperDetail.tsx` to render:
- job status and stage
- candidate list
- evidence snippet
- confidence badge
- verifier result

Keep the existing parameter editing/review actions intact.

- [ ] **Step 4: Run the UI test to verify it passes**

Run:
```bash
cd frontend
npm test -- PaperDetail.test.tsx
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/PaperDetail.tsx frontend/src/pages/Papers.tsx frontend/src/api/extraction.ts frontend/src/pages/PaperDetail.test.tsx
git commit -m "feat: show extraction evidence in review UI"
```

---

### Task 6: Add end-to-end verification for long-paper and multi-template cases

**Files:**
- Create: `backend/src/services/extraction/__tests__/longPaper.e2e.test.ts`
- Create: `backend/src/services/extraction/__tests__/multiTemplate.e2e.test.ts`
- Modify: `backend/package.json` if a test script alias is needed

- [ ] **Step 1: Write the failing integration tests**

Create a long-paper fixture test that asserts:
- a paper longer than one chunk produces multiple chunks
- a key field can be found in a later chunk
- the final job reaches `completed` or `needs_review` with evidence preserved

Create a multi-template test that asserts:
- the same paper can be processed against two templates
- template-specific fields remain isolated
- shared fields still aggregate correctly

- [ ] **Step 2: Run the tests and verify they fail**

Run:
```bash
cd backend
npm test -- longPaper.e2e.test.ts multiTemplate.e2e.test.ts
```
Expected: fail until orchestration and aggregation are in place.

- [ ] **Step 3: Implement fixtures and assertions**

Use representative long-paper fixtures and template YAML samples to verify the new pipeline is stable on long texts and multiple template shapes.

- [ ] **Step 4: Run the tests to verify they pass**

Run:
```bash
cd backend
npm test -- longPaper.e2e.test.ts multiTemplate.e2e.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/extraction/__tests__/longPaper.e2e.test.ts backend/src/services/extraction/__tests__/multiTemplate.e2e.test.ts backend/package.json
git commit -m "test: cover long-paper extraction pipeline"
```

---

### Task 7: Update documentation and rollout notes

**Files:**
- Modify: `docs/问题记录.md` if you keep operational notes there
- Create: `docs/superpowers/plans/2026-06-16-parameter-extraction-strategy-redesign.md` already covered by this plan
- Optional Modify: `CLAUDE.md` if the new extraction job flow changes project conventions

- [ ] **Step 1: Write the rollout note**

Document the new job-based extraction flow, the fact that extraction is asynchronous, and how reviewers inspect evidence-backed candidates.

- [ ] **Step 2: Verify the note matches the implemented endpoints and statuses**

Make sure names in the note match the actual route names and status values used in code.

- [ ] **Step 3: Commit**

```bash
git add docs/问题记录.md CLAUDE.md
git commit -m "docs: record new extraction pipeline behavior"
```

## Coverage Check

- Long paper coverage → Tasks 2, 3, 4, 6
- Multi-template support → Tasks 1, 2, 3, 6
- Evidence chain → Tasks 2, 3, 5
- Asynchronous flow → Tasks 1, 4
- Review integration → Tasks 4, 5
- Quality gates and tests → Tasks 2, 3, 6

## Notes for implementation

- Keep `parameters` and `parameter_versions` as the source of truth for final approved output.
- Do not remove current review endpoints until the new job flow is validated.
- Preserve `naturalLanguageQuery` unless a later task explicitly replaces it.
- Prefer small commits after each task.
