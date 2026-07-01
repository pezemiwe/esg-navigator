# Entity Structure: parent/subsidiary selection — spec for frontend

Status: proposed, not started. Backend/schema needs no changes — this is a frontend + store wiring gap only.

## Problem

`GovernanceAssessment.tsx` (Entity Structure block, ~lines 439-530) only offers:

- A binary radio: **Standalone Entity** / **Group / Parent Entity**.
- When "Group / Parent Entity" is picked, `groupName` is a free-text label — not a real entity record.
- Every subsidiary added via `addEntity()` hard-codes `parentId: null` (line ~193). There is no dropdown to
  pick an existing entity as parent, and no way to add a Group/Parent entity retroactively once subsidiaries
  already exist.

This means the app cannot represent anything beyond one flat level (one implicit "parent" label + a flat
list of children), even though the data model already supports arbitrary nesting.

## What already works — no schema/API change needed

- `Entity.parentId` is a self-relation in `server/prisma/schema.prisma` (`parent`/`children` on `Entity`),
  so arbitrary nesting depth is already supported server-side.
- `sectorId` / `subSector` already live on `Entity`, not on `AssessmentProject` — correct, because a
  diversified group's subsidiaries can sit in different SASB industries (a bank subsidiary and an insurance
  subsidiary of the same holding company are materially different for SRRO/CRRO purposes). Do **not** move
  sector to the project/group level.
- The frontend type `AssociatedEntity` (`src/store/sustainabilityStore.ts`) already has `parentId: string | null`
  and `EntityRelationshipType` already includes `"Parent"` as a valid value — it's just never offered in the
  UI's `<select>` (which only lists `Subsidiary | Joint Venture | Associate | Branch`).
- `apiSaveProject` / `PUT /api/projects/:id` already accepts and upserts an `entities[]` array with `parentId`
  per entity — the wire format doesn't need to change.

So this is entirely about: (1) making the "parent" a real `AssociatedEntity` row instead of a free-text
label, and (2) giving the user a way to pick/create that parent when adding an entity, in any order.

## Current save-time behaviour (relevant gotcha)

When `assessmentEntities` is empty, `saveCurrentProject()` synthesizes a single implicit entity row with
`id: ${activeProjectId}-parent`, `relationshipType: "Standalone"`, `parentId: null` (sustainabilityStore.ts
~line 770-787). This is what backs today's "Standalone Entity" radio option. Any change here must keep this
path working unchanged — it's the common case and shouldn't require extra clicks.

## Proposed UX

1. **Standalone stays exactly as-is.** No change to that path.

2. **"Group / Parent Entity" creates a real entity, not a label.**
   When the radio flips to Group, instead of showing a free-text "Group Name" field that's stored only as
   `groupName` on the project, create an actual `AssociatedEntity` with `relationshipType: "Parent"`,
   `parentId: null`, and push it into `assessmentEntities` via the existing `addAssessmentEntity()` action.
   Keep `groupName` as a derived/synced display label (or drop it and read the Parent entity's `name`
   instead — frontend dev's call, but don't keep two sources of truth for the same string).

3. **Adding any entity offers a parent picker.**
   The "Add subsidiary" row (name input + type `<select>`) gets a third control: a `<select>` populated
   from `assessmentEntities` filtered to entities that could legally be a parent (i.e. not the entity being
   added itself, and not one of its own descendants — walk `parentId` chains to prevent cycles). Default
   selection: the current Parent entity if one exists, otherwise disabled/empty (forces Standalone flow).
   On submit, `addEntity()` sets `parentId` to the selected id instead of hard-coding `null`.
   This also unlocks subsidiary-of-subsidiary nesting for free — no extra UI needed for that, the same
   picker just lists deeper entities too once they exist.

4. **"Promote to Group" action for the retroactive case.**
   This is the scenario you flagged: a user already added one or more standalone/subsidiary entities, then
   realizes they need a Group wrapper. Add a button (e.g. next to the entity chip list) that:
   - Prompts for a Group/Parent entity name.
   - Creates the new Parent `AssociatedEntity` (`relationshipType: "Parent"`, `parentId: null`).
   - Reassigns `parentId` on any currently-`null`-parented entities to the new parent's id (a bulk
     "these become subsidiaries of the new group" reassignment — for a first cut, promoting *all*
     existing top-level entities is fine; a multi-select "which of these should move under the new group"
     picker is a nice-to-have, not a blocker).
   - Flips the Standalone/Group radio to Group.

5. **Removing a Parent entity that still has children** should be blocked (or should prompt to reassign/
   orphan the children first) — don't allow an orphaned `parentId` pointing at a deleted id.

## Store changes needed (`src/store/sustainabilityStore.ts`)

- `addAssessmentEntity` already accepts a full `AssociatedEntity` including `parentId` — no signature change,
  just start passing a real value instead of `null` from the component.
- New action suggested: `reassignEntityParent(entityId: string, newParentId: string | null)` for the picker
  and for the promote-to-group bulk reassignment, rather than removing/re-adding entities.
- New action suggested: `promoteToGroup(parentName: string)` encapsulating step 4 above (create parent
  entity, reassign existing top-level entities, flip `isGroupAssessment`).
- Cycle guard belongs in the store (or a shared helper), not just the UI — validate `parentId` chains don't
  loop before accepting `reassignEntityParent`.

## Explicitly out of scope for this pass

- **Cross-project entity reuse.** Entities are currently scoped to a single `AssessmentProject`
  (`Entity.projectId` is required, no global org/client registry). So "select an existing parent entity"
  only ever means "an entity already added in *this* assessment" — not a subsidiary that was profiled in a
  different assessment engagement last year. Building a reusable client/organisation master record is a
  bigger change (new Prisma model, migration, and a real decision on how re-engagements should work) and
  should be its own proposal if you want it — flagging it here so it isn't assumed to be covered.
- No change to how sector/industry is selected at entity level — already correct.
