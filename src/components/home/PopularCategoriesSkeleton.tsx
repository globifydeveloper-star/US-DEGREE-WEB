import { Skeleton } from "antd";

/**
 * Mimics one Popular Categories card: icon + CredentialLevelChip on top,
 * title, description. The chip placeholder is sized to match the real
 * chip's rendered height so nothing shifts once data loads.
 */
function PopularCategoryCardSkeleton() {
  return (
    <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-gray-50 border border-gray-100">
      <div className="flex items-start justify-between mb-3 sm:mb-6">
        <Skeleton.Avatar
          active
          shape="square"
          size={28}
          style={{ borderRadius: 8 }}
        />
        <Skeleton.Button
          active
          size="small"
          style={{ width: 70, height: 18, borderRadius: 9999 }}
        />
      </div>
      <Skeleton.Input
        active
        size="small"
        style={{ width: "70%", height: 18, marginBottom: 10 }}
      />
      <Skeleton.Input
        active
        size="small"
        style={{ width: "100%", height: 12, marginBottom: 6 }}
      />
      <Skeleton.Input active size="small" style={{ width: "85%", height: 12 }} />
    </div>
  );
}

export default function PopularCategoriesSkeleton({
  count = 6,
}: {
  count?: number;
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PopularCategoryCardSkeleton key={i} />
      ))}
    </div>
  );
}
