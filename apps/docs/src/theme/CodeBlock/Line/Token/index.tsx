import React, { type ReactNode } from 'react';
import { useCodeBlockContext } from '@docusaurus/theme-common/internal';
import useBaseUrl from '@docusaurus/useBaseUrl';
import type { Props } from '@theme/CodeBlock/Line/Token';
import apiLinks from '../../../../apiLinks';

const identifier = /\b[A-Za-z_$][\w$]*\b/g;

export default function CodeBlockLineToken({
  line: _line,
  token,
  children,
  ...props
}: Props): ReactNode {
  const { metadata } = useCodeBlockContext();
  const apiBaseUrl = useBaseUrl('/api/');
  const language = metadata.language;

  if (language !== 'ts' && language !== 'tsx' && language !== 'typescript') {
    return <span {...props}>{children}</span>;
  }

  if (token.types.some((type) => type === 'comment' || type === 'string')) {
    return <span {...props}>{children}</span>;
  }

  const content = token.content;
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(identifier)) {
    const name = match[0];
    const path = apiLinks.get(name);
    if (!path) continue;

    const index = match.index!;
    parts.push(content.slice(lastIndex, index));
    parts.push(
      <a
        className="codeApiLink"
        href={`${apiBaseUrl}${path.slice('/api/'.length)}`}
        key={index}
        title={`View ${name} API documentation`}
      >
        {name}
      </a>,
    );
    lastIndex = index + name.length;
  }

  if (parts.length === 0) return <span {...props}>{children}</span>;
  parts.push(content.slice(lastIndex));
  return <span {...props}>{parts}</span>;
}
