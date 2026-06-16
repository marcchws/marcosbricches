import * as runtime from "react/jsx-runtime";
import type { ComponentType } from "react";

type MDXModule = { default: ComponentType };

// Velite compiles MDX bodies to function-body code that returns the component
// when called with a JSX runtime. Runs at build time (SSG), so no CSP concern.
function getMDXComponent(code: string): ComponentType {
  const factory = new Function(code) as (r: typeof runtime) => MDXModule;
  return factory(runtime).default;
}

/* eslint-disable react-hooks/static-components --
   The component is compiled from static MDX at build time and rendered once
   during SSG; there is no client state to reset. */
export function MDXContent({ code }: { code: string }) {
  const Component = getMDXComponent(code);
  return <Component />;
}
