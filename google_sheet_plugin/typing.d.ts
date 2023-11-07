declare namespace JSX {
  interface IntrinsicElements {
    'wc-codemirror': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        mode?: string;
        value?: string;
        style?: React.CSSProperties;
        change?: Function;
      },
      HTMLElement
    >;
  }
}
