interface Props {
  text: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export const Label = ({ text, type }: Props) => {
  const color = {
    success: 'bg-success',
    error: 'bg-accent',
    warning: 'bg-warning',
    info: 'bg-primary',
  };

  return (
    <span
      className={`text-xs text-white px-2 py-[4px] rounded-full ${color[type]}`}
    >
      {text}
    </span>
  );
};
