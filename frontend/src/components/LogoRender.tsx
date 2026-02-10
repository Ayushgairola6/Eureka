export const LOGO_VARIANTS = [
  {
    id: "split-badge-original",
    name: "Split Badge (Original)",
    render: (
      <div className="flex items-center font-mono text-sm">
        <div className="dark:bg-white dark:text-black bg-black text-white uppercase px-1">
          AN
        </div>
        <label className="uppercase ml-1">-tinode</label>
      </div>
    ),
  },
  {
    id: "signal-break",
    name: "Signal Break",
    render: (
      <div className="flex items-center font-mono text-sm uppercase">
        <span className="border border-current px-1 mr-1">AN</span>
        <span className="tracking-widest">TINODE</span>
      </div>
    ),
  },
  {
    id: "inline-inversion",
    name: "Inline Inversion",
    render: (
      <div className="font-mono uppercase tracking-wider text-sm">
        AN
        <span className="bg-black text-black dark:black dark:bg-white px-[2px] mx-[2px]">
          TI
        </span>
        NODE
      </div>
    ),
  },
  {
    id: "binary-cut",
    name: "Binary Cut",
    render: (
      <div className="flex font-mono uppercase text-sm">
        <span className="font-bold">AN</span>
        <span className="opacity-60 mx-1">/</span>
        <span className="tracking-widest">TINODE</span>
      </div>
    ),
  },
  {
    id: "node-marker",
    name: "Node Marker",
    render: (
      <div className="flex items-center font-mono uppercase text-sm tracking-wide">
        <span>ANTI</span>
        <span className="w-[4px] h-[4px] bg-current rounded-full mx-1" />
        <span>NODE</span>
      </div>
    ),
  },
  {
    id: "bracketed-identity",
    name: "Bracketed Identity",
    render: (
      <div className="font-mono uppercase text-sm tracking-widest">
        <span className="opacity-60">[</span>
        ANTINODE
        <span className="opacity-60">]</span>
      </div>
    ),
  },
  {
    id: "stacked-microtype",
    name: "Stacked Microtype",
    render: (
      <div className="leading-none">
        <div className="space-grotesk text-xs opacity-60 tracking-widest">
          ANTI
        </div>
        <div className="bai-jamjuree-bold text-md  tracking-wider">NODE</div>
      </div>
    ),
  },
];
import { useAppSelector } from "../store/hooks";

export const LogoRender = () => {
  const { variant } = useAppSelector((s) => s.auth);
  const logo = LOGO_VARIANTS.find((v) => v.id === variant);
  return logo?.render ?? null;
};
