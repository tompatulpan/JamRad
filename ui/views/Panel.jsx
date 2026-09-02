import React from 'react';

// CRT/SDR console-style boxed section, e.g.
// ┌─ TITLE ─────────────────────┐
// │ ...                         │
// └─────────────────────────────┘
export default function Panel({title, children, className, style}) {
  return (
    <fieldset
      className={'jam-panel' + (className ? ' ' + className : '')}
      style={style}
    >
      {title && <legend>{title}</legend>}
      {children}
    </fieldset>
  );
}
