#!/usr/bin/env node
// PreToolUse gate: steer code lookups to graft instead of whole-file reads and
// repo-wide greps. Only applies to source files graft has indexed (a node exists
// at graft/<path-without-ext>.md); docs, configs, CSS and unindexed files pass.
// Exit 2 blocks the call and feeds stderr back to the agent. Any internal error
// allows the call — the gate must never wedge a session.
// Disable for a session with GRAFT_GATE=off.
const fs = require('fs');
const path = require('path');

const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const GRAPH_DIR = path.join(ROOT, 'graft');
const MAX_WHOLE_READ_LINES = 120; // small files are cheaper to read than to query
const CODE_EXT = /\.(tsx?|jsx?|cjs|mjs)$/;
const CODE_TYPES = new Set(['ts', 'tsx', 'js', 'jsx']);

function rel(p) {
  return path.relative(ROOT, path.resolve(ROOT, p));
}

function isIndexed(p) {
  const r = rel(p);
  if (r.startsWith('..') || !CODE_EXT.test(r)) return false;
  return fs.existsSync(path.join(GRAPH_DIR, r.replace(CODE_EXT, '') + '.md'));
}

function isIndexedDir(p) {
  const r = rel(p);
  if (r === '' ) return true; // repo root contains indexed code
  if (r.startsWith('..')) return false;
  return fs.existsSync(path.join(GRAPH_DIR, r)) && fs.statSync(path.join(GRAPH_DIR, r)).isDirectory();
}

function lineCount(p) {
  try {
    return fs.readFileSync(path.resolve(ROOT, p), 'utf8').split('\n').length;
  } catch {
    return 0;
  }
}

function checkRead(input) {
  const file = input.file_path;
  if (!file || input.offset || input.limit || !isIndexed(file)) return null;
  const lines = lineCount(file);
  if (lines <= MAX_WHOLE_READ_LINES) return null;
  const r = rel(file);
  return `${r} is ${lines} lines and indexed by graft. Get its API with \`graft skeleton ${r}\` ` +
    `or the relevant code with \`graft ask "<what you need>" --source\`, then Read only the ` +
    `exact span with offset/limit.`;
}

function checkGrep(input) {
  const target = input.path || '.';
  const globIsCode = input.glob ? /\.(tsx?|jsx?|[cm]js)\b|\{[^}]*tsx?/.test(input.glob) : false;
  const globIsOther = input.glob && !globIsCode;
  const typeIsCode = input.type && CODE_TYPES.has(input.type);
  const hitsCode = isIndexed(target) || (isIndexedDir(target) && !globIsOther && !(input.type && !typeIsCode));
  if (!hitsCode && !typeIsCode && !globIsCode) return null;
  return `This search covers graft-indexed source. Use \`graft grep "${input.pattern}"\` (exhaustive, ` +
    `grouped by enclosing symbol), \`graft callers <symbol>\` for references, or ` +
    `\`graft ask "<question>" --source\`. For docs/config, narrow Grep with a glob like "*.md".`;
}

function checkBash(input) {
  const cmd = input.command || '';
  if (/\bgraft\b/.test(cmd)) return null;
  for (const seg of cmd.split(/&&|\|\||;|\n/)) {
    const s = seg.trim();
    // Only the first command of a pipeline reads files; `x | grep` filters output.
    const head = s.split('|')[0].trim();
    const words = head.split(/\s+/);
    const bin = path.basename(words[0] || '');
    const args = words.slice(1).filter((w) => !w.startsWith('-'));
    const flags = words.slice(1).filter((w) => w.startsWith('-')).join(' ');
    if (['grep', 'rg', 'ag', 'egrep'].includes(bin)) {
      const recursive = bin !== 'grep' && bin !== 'egrep' ? true : /-[a-zA-Z]*[rR]/.test(flags);
      const paths = args.slice(1);
      const codeHit = paths.some((p) => isIndexed(p)) ||
        (recursive && (paths.length === 0 || paths.some((p) => isIndexedDir(p))) && !/--include=\S*\.(md|json|ya?ml|css)/.test(head));
      if (codeHit) {
        return `\`${head}\` searches graft-indexed source. Use \`graft grep "<literal>"\` or ` +
          `\`graft callers <symbol>\` instead (raw grep is fine for docs/config — target those paths directly).`;
      }
    }
    if (bin === 'cat') {
      const big = args.find((p) => isIndexed(p) && lineCount(p) > MAX_WHOLE_READ_LINES);
      if (big) {
        return `\`cat ${rel(big)}\` dumps a large indexed file. Use \`graft skeleton ${rel(big)}\` or ` +
          `\`graft ask "<what you need>" --source\`, then read just the span (sed -n 'A,Bp' or Read with offset/limit).`;
      }
    }
  }
  return null;
}

function main(raw) {
  if (process.env.GRAFT_GATE === 'off' || !fs.existsSync(GRAPH_DIR)) return 0;
  const { tool_name: tool, tool_input: input = {} } = JSON.parse(raw);
  const check = { Read: checkRead, Grep: checkGrep, Bash: checkBash }[tool];
  const reason = check ? check(input) : null;
  if (!reason) return 0;
  process.stderr.write(`[graft-gate] ${reason} (Set GRAFT_GATE=off to bypass.)\n`);
  return 2;
}

let raw = '';
process.stdin.on('data', (c) => { raw += c; });
process.stdin.on('end', () => {
  try {
    process.exitCode = main(raw);
  } catch {
    process.exitCode = 0;
  }
});
