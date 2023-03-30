// import { createEffect, createSignal } from "solid-js";
// import Prism from "prismjs";
// import "prismjs/themes/prism.css";
// import '../styles/prismjs-theme.css';
// // import "prismjs/components/prism-css";
// import "prismjs/components/prism-typescript";
// import "prismjs/components/prism-jsx";
// import "prismjs/components/prism-json";

// const CodeBlock = (props: { code: string; language: string }) => {
//   const [highlightedCode, setHighlightedCode] = createSignal("");

//   createEffect(() => {
//     setHighlightedCode(
//       Prism.highlight(props.code, Prism.languages[props.language], props.language)
//     );
//   });

//   return (
//     <pre>
//       <code class={`language-${props.language}`} innerHTML={highlightedCode()} />
//     </pre>
//   );
// };

// export default CodeBlock;
