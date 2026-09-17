---
name: evergreen-context
description: >
  Use when creating or updating files under context/ — deciding whether a
  sentence belongs in context, writing or amending a context topic file,
  or when someone asks "where does this go", "is this evergreen", "should I
  document this here", or "how do I update context". Also use when adding a
  new feature or package that needs its context folder.
---

# Evergreen context

Context files are the living description of the system as it is. They are
edited whenever the system changes — including *ahead* of the code, so that
while a change is in flight, context is the spec. After the change lands,
context is the truth.

There are no plan documents, no TODO lists, no status trackers. Anything a
plan document used to hold has a home: context (lasting facts), a formula or
task tracker (ordering), or git history (dates, who, what changed).

## The cycle

1. **Docs lead.** Amend or add `context/<feature>/<topic>.md` so it
   describes the target state. Present tense, as if already true.
2. **Implement.** The code catches up to the context.
3. **Verify.** Confirm context matches reality after the change.

## Where does this text go?

| The text... | Goes to |
|---|---|
| explains how something works or why it is shaped this way | `context/<feature>/<topic>.md` |
| records a rejected alternative that stays rejected ("why X, not Y") | `context/<feature>/<topic>.md` |
| is true today and stays true until someone changes the system | `context/<feature>/<topic>.md` |
| says "first do X, then Y", or is a checklist | a task/formula, not context |
| is an acceptance check for one step | the step's description |
| is a risk or trade-off of one specific change | the change's decision record |
| is what was learned doing a change | the retrospective; durable facts go into context |

**Litmus:** if the sentence is wrong after the change ships, it is not
context. If it orders things, it is a task. If it dates things, it is history.

## Evergreen context: rules

**Lifetime:** as long as the system is built this way. Never dated in the
body. No version numbers, no "as of", no "currently".

**Voice:** present tense, declarative, about the system.
- "The promptline shows token-per-second throughput while the assistant
  streams."
- Never "we will", never "step 1", never "currently", never "TODO".

**Contains:**
- How a mechanism works, at the level a reader needs to change it safely.
- Why it is shaped this way, including what breaks if it drifts.
- Alternatives rejected *and still rejected*, because the reason is still
  true.
- Facts worth keeping that the code does not make obvious.

**Does not contain:**
- Dates, commit hashes, PR numbers, issue ids.
- Task lists, progress, status ("done", "in progress", "next steps").
- Who did it or who should do it next.
- Instructions to a future worker.
- A "Status" or "Next steps" section — that is a plan in disguise.

**Shape:**
- One file per mechanism.
- One folder per feature or package.
- Headings are nouns or noun phrases, not verbs.
  - Good: `## TPS engine`, `## Event wiring`, `## Status line layout`
  - Bad: `## How to measure TPS`, `## Wiring up events`
- A file that wants a "Next steps" section is the wrong file. Split it.

## Structure

The repo uses this layout under `context/`:

```
context/
  .rules/                    # writing rules (templates, structure)
  extension/                 # per-extension docs (leaf level)
    <extension-name>/
      <extension-name>.md    # index/overview
      <topic>.md             # one mechanism per file
  packages/
    extensions/
      <package-name>/
        <package-name>.md    # index with file structure
        features/
          <feature-name>/
            <leaf>.md        # one actionable unit
        shared/
          <leaf-name>/
            <leaf>.md        # reusable across features
```

### Index doc (`<name>.md` at the root of a package/extension folder)

- One-line description of what the package/extension provides.
- A `## Features` section listing sub-features with `[[wikilinks]]`.
- A `## File Structure` section with the `src/` tree.

### Topic file (`<topic>.md`)

- Opens with 2–5 sentences of present-tense description.
- `##` headings name the mechanisms or concerns.
- `[[wikilinks]]` cross-reference sibling topic files.
- No front-matter beyond what the project requires.

### Leaf doc (under `features/` or `shared/`)

- Describes one callable unit: one command, one function, one component.
- One leaf = one job. If it does two things, split it.

## Updating

When the system changes:

1. **Identify the affected files.** Which `context/` folder(s) and
   topic file(s) describe the mechanism you are changing?
2. **Amend before or during the code change.** The target state goes in
   context first. Present tense. As if already true.
3. **Do not add history.** Do not write "previously X, now Y". Git holds
   that. Context only says what it is.
4. **Do not add status.** No "TODO", no "this will be replaced by". If the
   replacement is a lasting design fact, state it as the new truth.
5. **Verify after.** Read the file. Does it match the code? Is it present
   tense? Are the headings nouns? Would a new reader understand the
   mechanism and its boundaries?

### New feature or package

- Create the folder under `context/extension/` or `context/packages/<group>/`.
- Write the index doc (description, features list, file structure).
- Write one topic file per mechanism.
- Cross-link with `[[wikilinks]]`.

### Removing a mechanism

- Delete the topic file.
- Remove its entry from the index doc.
- Remove any `[[wikilinks]]` pointing to it.
- Do not leave a tombstone or a "removed" note.

## Quick discriminators

| Test | Result |
|---|---|
| Wrong after the change ships? | Not context. |
| Orders things (step 1, step 2)? | Not context. |
| Justifies the system's shape? | Context. |
| Weighs a trade-off of one change? | Not context (decision record). |
| Names a date, id, or status? | Not context. |
| Still true if the code is rewritten? | Probably not context. |

## Templates

Blank templates for new docs live under `context/.rules/writing-rules/Projects/Templates/`.
Use them as starting points for:
- New project docs (`I. Project.md`)
- New app docs (`II. App.md`)
- New package docs (`III. Package.md`)
- New leaf docs (`IV. Leaf.md`)
- Reference docs (`V. Reference.md`)
