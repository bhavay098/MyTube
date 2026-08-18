# AGENTS.md

Instructions for AI coding agents working in this repository.
These rules apply regardless of language or framework unless a section says otherwise.

## 0. Golden Rule: Simplicity First

- Solve exactly what was asked. Do not add features, abstractions, or "nice to haves" that weren't requested.
- Prefer the simplest solution that is still correct and production-safe. If you're choosing between a 10-line
  solution and a 100-line "flexible" one, choose the 10-line one unless there's a stated reason to scale it up.
- Do not introduce a design pattern, library, or layer of abstraction unless the current problem actually needs it.
  "We might need this later" is not a reason to add it now.
- If a task can be done in one function, don't split it into five. If a task needs one file, don't create a folder.
- Before writing code, mentally check: "Am I over-engineering this?" If yes, simplify before writing.
- When there are multiple valid approaches, briefly state the one you're using and why, especially if you chose
  the simpler one over a more "impressive" one.

## 1. Available Skills

- Before starting a task, check whether an installed skill applies to it. If a skill's description matches the
  current task, use it — don't rely on generic/default knowledge when a specific skill for this exact job is
  already available.
- If multiple skills could plausibly apply, briefly check more than one before picking; don't stop at the first
  match if a more specific one exists.
- If you're unsure whether a skill applies, say so and ask, rather than silently ignoring it or silently
  guessing which one to use.
- If more than one installed skill could apply to the same task (e.g. several frontend/design-related skills),
  don't blend them silently or pick one at random. Briefly tell me which ones seemed relevant and which you're
  using (and why), or ask if it's not clear-cut — especially if their guidance could conflict.
- Do not modify the contents of a skill's own files unless I explicitly ask you to.

## 2. Before Starting Any New Project or Feature

- Ask clarifying questions if requirements are ambiguous — do not guess silently on anything that changes the
  architecture (auth strategy, database choice, API shape, etc).
- Propose the folder/file structure before generating many files, if the project is non-trivial.
- Confirm the tech stack and versions being used (don't assume — check package.json / requirements.txt /
  go.mod / etc. if the project already exists).
- Check for existing conventions in the codebase (naming, folder layout, formatting) and follow them instead
  of introducing your own style.

## 3. Code Quality Standards (Production-Grade)

- **Correctness first.** Code must actually work, handle edge cases, and not silently fail.
- **Error handling is mandatory.** Never swallow errors silently. Handle expected failure cases explicitly
  (network failures, invalid input, missing data, empty states).
- **Input validation.** Validate all external input (user input, API responses, env vars) before using it.
- **No hardcoded secrets, API keys, or credentials.** Always use environment variables / config files, and
  never commit `.env` files.
- **No magic numbers/strings.** Use named constants when a value has meaning.
- **Naming matters.** Variables, functions, and files should be self-explanatory. No `data2`, `temp`, `foo`.
- **Consistent formatting.** Follow the language's standard style guide / linter / formatter conventions
  (e.g. Prettier for JS/TS, PEP8 for Python, gofmt for Go).
- **Type safety where available.** Use TypeScript types, Python type hints, etc. Avoid `any` / untyped
  escape hatches unless truly necessary.
- **Security basics.** Sanitize inputs, avoid SQL injection risks (use parameterized queries/ORMs), avoid
  exposing stack traces or internal errors to end users.
- **No dead code.** Don't leave commented-out code blocks, unused imports, or unused variables.

## 4. Keep It Readable and Minimal

- Prefer clear, boring code over clever one-liners. Readable > clever.
- Keep functions short and focused on one responsibility. If a function is doing 3 different things, split it —
  but don't over-split trivial logic either.
- Avoid unnecessary layers of indirection (e.g. don't wrap a simple function call in three helper functions
  "for structure" if it's not needed).
- Only add comments where the _why_ isn't obvious from the code itself. Don't narrate every line.
- Since I'm learning: briefly explain non-obvious decisions (e.g. why a library was chosen, why a pattern
  was used) in a short comment or a short note in your response — not a full lecture, just 1-2 lines.

## 5. Dependencies

- Don't add a new library/package unless it's clearly justified. Prefer the language's standard library first.
- If you do add a dependency, briefly mention why (in your chat response, not necessarily inline as a comment).
- Avoid adding heavy dependencies for trivial tasks (e.g. don't pull in a whole utility library for one function).

## 6. Response Behavior (How to Work With Me)

- Don't generate large amounts of code for small tasks. Match code size to task size.
- If a request seems like it could balloon into a huge amount of code, pause and propose a scoped-down plan
  first, rather than generating everything at once.
- When editing existing code, change only what's needed for the task. Don't refactor unrelated code unless asked.
- If there are multiple ways to implement something, pick the production-appropriate one by default (not the
  quick hacky one), but keep it as simple as that standard allows.
- If you're unsure whether something is over-engineered or under-engineered, ask, or state your assumption
  briefly before proceeding.

## 7. Testing & Validation (when applicable)

- For non-trivial logic, include basic tests or at least clearly state what should be tested.
- Don't skip error/edge cases in tests just to keep things short — testing IS where thoroughness matters.
- Verify code runs / makes logical sense before presenting it as final, don't assume correctness.
- After making changes, run the project's install/build/test/lint commands (see Section 10) if available, and fix
  failures before presenting the work as done.

## 8. Frontend-Specific

- Follow the existing component structure and styling approach already used in the project (don't mix, e.g.,
  CSS Modules into a Tailwind project without being asked).
- Handle loading, empty, and error states for every view that fetches or depends on async data — not just the
  happy path.
- Basic accessibility by default: semantic HTML elements, proper labels on form inputs, sufficient color
  contrast, keyboard-navigable interactive elements. Don't skip this to save time.
- Don't introduce a state management library (Redux, Zustand, etc.) for state that local/component state or
  context can handle.
- **Do not put an entire page/feature into one giant component.** Split by responsibility as you build, not as
  a later refactor:
  - If a chunk of JSX is a distinct visual unit (a card, a form, a modal, a list item, a header), it's a
    separate component — even if it's only used once right now.
  - If a piece of logic (data fetching, form validation, a computed value) is reusable or non-trivial, pull it
    into a custom hook instead of inlining it in the component body.
  - A rough smell-test: if a component file is pushing past ~150-200 lines, or you're scrolling a lot to find
    one piece of UI, it's doing too much — split it.
  - Reusable UI (buttons, inputs, cards) goes in a shared `components/` (or existing equivalent) location, not
    redefined inline each time it's needed.
  - This still respects Section 0 (Simplicity First) — the goal is one component per clear responsibility, not
    maximal fragmentation. Don't split a 5-line wrapper into its own file for no reason; don't extract a
    single-use trivial element either. The line to split on is "distinct responsibility," not "any JSX block."

## 9. Backend-Specific

- Validate and sanitize all incoming request data at the API boundary, not deep inside business logic.
- Use parameterized queries / ORM methods — never build SQL via string concatenation.
- Return proper HTTP status codes and consistent error response shapes; don't leak stack traces or internal
  error details to API responses.
- Keep secrets, DB credentials, and API keys out of code — env vars only, and confirm `.env`/secrets files are
  gitignored.
- Consider basic rate limiting / auth checks on endpoints that need them — don't assume "I'll add auth later."
- Watch for obvious performance traps: N+1 queries, unbounded loops over DB results, missing indexes on
  frequently-queried columns.

## 10. Environment, Setup & Verification Commands

- Before assuming how to install, run, build, test, or lint this project, check for existing config
  (`package.json` scripts, `Makefile`, `README`, CI config) rather than guessing generic commands.
- If this section is filled in for the current project, use these commands to verify your own work after
  changes:
  - Install:
  - Run dev server:
  - Run tests:
  - Lint/format:
  - Build:
- If no commands are defined here and none are discoverable in the repo, choose sensible, standard defaults for
  the language/stack in use (e.g. `npm test`/`vitest`/`jest` for a Node project with no test script yet, `pytest`
  for Python, etc.) rather than stopping to ask. Briefly state what you set up and why. Don't silently invent
  an unusual or heavyweight toolchain — pick the boring, widely-used default for that ecosystem.
- If setting up a new tool (e.g. a test runner) requires adding a dependency, this still follows the Dependencies
  (Section 5) and Stop and Ask (Section 12) rules — a standard test runner for the stack is fine to add on your
  own judgment, but mention it; anything unusual or heavy should be flagged first.

## 11. Git & Commit Behavior

- Don't run `git commit`, `git push`, or `git reset --hard` unless I explicitly ask you to.
- Never force-push, never rewrite shared history, never touch `git config`.
- If you do commit, write clear commit messages (what changed and why, not just "update files").
- Only stage/commit files relevant to the current task — don't sweep in unrelated changes.

## 12. Stop and Ask Before Proceeding

Pause and check with me before doing any of the following, even if it seems like the obvious next step:

- Deleting files, dropping database tables/columns, or any other irreversible/destructive action.
- Writing or changing a database migration/schema.
- Adding a new dependency that wasn't already in the project.
- Changing authentication, authorization, or permission logic.
- Modifying CI/CD, deployment config, or production environment settings.
- Making a change that touches many files at once for what looked like a small request.

## 13. File & Directory Boundaries

- Don't edit generated/build output (e.g. `dist/`, `build/`, `.next/`), lockfiles (edit via package manager
  commands, not by hand), or anything in `node_modules` / vendor directories.
- Don't modify CI config files, `.env` files, or infrastructure-as-code files unless the task explicitly asks
  for that.

## 14. Things to Avoid

- Don't rewrite the whole file when a small edit will do.
- Don't invent requirements that weren't asked for.
- Don't leave TODOs for critical functionality — either implement it or flag it explicitly as missing.
- Don't use deprecated APIs/methods when a current standard alternative exists.
- Don't silently change the project's existing patterns/style without saying so.
