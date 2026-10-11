import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { StartupBrandLoader } from '../src/components/startup-brand-loader';

describe('approved startup composition', () => {
  it('preserves every approved vector and normalized stroke drawing', () => {
    const approved = readFileSync(new URL('./fixtures/approved-signature.svg', import.meta.url), 'utf8');
    const rendered = renderToStaticMarkup(createElement(StartupBrandLoader));
    const paths = (source: string) => [...source.matchAll(/ d="([^"]+)"/g)].map(match => match[1]);
    expect(paths(rendered)).toEqual(paths(approved));
    expect(rendered).toContain('viewBox="170 250 684 700"');
    expect(rendered).toContain('translate(354 812) scale(.6)');
    expect((rendered.match(/pathLength="1"/g) ?? []).length).toBe(9);
    expect(rendered).not.toMatch(/button|Replay|Auto-loop/);
  });
});
