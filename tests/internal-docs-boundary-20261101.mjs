/* Internal working material belongs outside the public repository. Scientific
 * test fixtures are versioned inputs, separate from handovers and reports. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const tracked=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const internal=tracked.filter(file=>/^(?:docs\/|\.local-internal\/|RELEASE_CHECKLIST\.md$|marketing\/[^/]+\.md$)/.test(file)||/\/(?:CLAUDE|CODEX)_(?:HANDOVER|AUDIT)[^/]*\.(?:md|csv)$/i.test(file));
assert.deepEqual(internal,[],'Internal handovers/reports must not be committed');
for(const file of ['docs/private-note.md','.local-internal/private-note.md','RELEASE_CHECKLIST.md','marketing/private-post.md'])execFileSync('git',['check-ignore','--quiet','--',file]);
console.log('PASS internal document boundary; local working files ignored');
