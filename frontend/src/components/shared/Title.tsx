interface TitleProps {
  text: string;
  className?: string;
}

export default function Title({ text, className = "" }: TitleProps) {
  return (
    <h1 className={`text-3xl font-extrabold ${className}`}>
      {text}
    </h1>
  );
}