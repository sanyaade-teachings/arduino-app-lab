import { TagStyle } from '@codemirror/language';

import { useCodeBlock } from './hooks/useCodeBlock';

interface CodeBlockElementProps {
  code: string;
  language?: string;
  customTags?: TagStyle[];
  classes?: { container: string };
}

const CodeBlockElement: React.FC<CodeBlockElementProps> = (
  props: CodeBlockElementProps,
) => {
  const { classes, code, language, customTags } = props;

  const ref = useCodeBlock(code, language, customTags);

  return <div ref={ref} className={classes?.container} />;
};

export default CodeBlockElement;
