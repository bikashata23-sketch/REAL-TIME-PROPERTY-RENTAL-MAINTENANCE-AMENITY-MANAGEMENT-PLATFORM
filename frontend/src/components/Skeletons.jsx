export const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-ink-200 p-5">
    <div className="skeleton h-4 w-24 mb-3" />
    <div className="skeleton h-7 w-16" />
  </div>
);

export const SkeletonRow = ({ columns = 4 }) => (
  <tr>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="skeleton h-4 w-full" />
      </td>
    ))}
  </tr>
);

export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonRow key={i} columns={columns} />
    ))}
  </>
);
