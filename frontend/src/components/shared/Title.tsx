interface TitleProps {
  text: string;
  className?: string;
}

export default function Title({ text, className = "" }: TitleProps) {
  return (
    <h1 className={`2xl:text-3xl text-2xl font-extrabold ${className}`}>
      {text}
    </h1>
  );
}