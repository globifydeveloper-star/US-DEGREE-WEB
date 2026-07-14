interface DesktopRowLabelProps {
  title: string;
  subtitle: string;
}

/** The sticky left-hand cell of a table row, showing the metric's name and a short description. */
export default function DesktopRowLabel({ title, subtitle }: DesktopRowLabelProps) {
  return (
    <td className="p-4 md:p-8 sticky left-0 bg-white font-black text-slate-700 z-10 border-r border-gray-100">
      <div>
        <p className="font-bold text-slate-800 text-xs md:text-sm">{title}</p>
        <p className="text-[8px] md:text-[10px] font-semibold text-gray-400 mt-0.5">
          {subtitle}
        </p>
      </div>
    </td>
  );
}
