export default function DashboardHeader({ username }: { username: string }) {
  return (
    <div className="mb-6">
      <p className="text-lg font-semibold">Welcome back, {username}</p>
      <p className="text-sm text-gray-500 mt-0.5">Ready for today&apos;s run?</p>
    </div>
  );
}