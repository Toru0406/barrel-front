interface Props {
  children: React.ReactNode;
  className?: string;
}

/** カテゴリ・セクションラベル（Oswald 大文字、緑） */
export default function Eyebrow({ children, className = "" }: Props) {
  return (
    <span className={`eyebrow ${className}`}>
      {children}
    </span>
  );
}
