type Props = {
  from: string;
  via: string;
  to: string;
  top: string;
};
export const LightBlob: React.FC<Props> = ({
  from,
  via,
  to,
  top,
}) => {
  return (
    <>
      <div

        className={`animate-custom-rotate pointer-events-none absolute ${top ? top : "top-0"}   
        h-4/5 left-10 md:left-50 w-full md:w-1/2 blur-[100px] bg-gradient-to-r ${from} ${via} ${to} 
          `}
      />
    </>
  );
};
