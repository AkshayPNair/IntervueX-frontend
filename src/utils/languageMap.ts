// Map some common Judge0 language names to Monaco identifiers
export function judge0NameToMonaco(id:number,name?: string): string {
    const lower = (name||'').toLowerCase();
    if (lower.startsWith('c++')) return 'cpp';
    if (lower.startsWith('c#')) return 'csharp';
    if (lower.startsWith('c ')) return 'c';
    if (lower.includes('python')) return 'python';
    if (lower.includes('java')) return 'java';
    if (lower.includes('javascript') || lower.includes('node')) return 'javascript';
    if (lower.includes('typescript')) return 'typescript';
    if (lower.includes('go ')) return 'go';
    if (lower.includes('kotlin')) return 'kotlin';
    if (lower.includes('ruby')) return 'ruby';
    if (lower.includes('rust')) return 'rust';
    if (lower.includes('swift')) return 'swift';
    if (lower.includes('php')) return 'php';
    if (lower.includes('scala')) return 'scala';
    if (lower.includes('perl')) return 'perl';
    if (lower.includes('r ')) return 'r';
    if (lower.includes('haskell')) return 'haskell';
    if (lower.includes('elixir')) return 'elixir';
    if (lower.includes('dart')) return 'dart';
    return 'plaintext';
  }