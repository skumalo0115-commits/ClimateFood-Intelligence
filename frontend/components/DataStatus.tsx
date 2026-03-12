interface Props {
  loading: boolean;
  error: string;
}

export default function DataStatus({ loading, error }: Props) {
  if (error) {
    return <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>;
  }

  if (loading) {
    return (
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
        Loading live data...
      </div>
    );
  }

  return null;
}
