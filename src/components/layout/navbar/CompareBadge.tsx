interface CompareBadgeProps {
  count: number;
}

export default function CompareBadge({ count }: CompareBadgeProps) {
  return (
    <span className="bg-[#3b5bdb] text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[18px] text-center leading-none">
      {count}
    </span>
  );
}
