const LoadingSpinner = ({ label = "Loading" }) => {
  return (
    <div className="flex min-h-40 items-center justify-center gap-3 text-slate-600">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

export default LoadingSpinner;
