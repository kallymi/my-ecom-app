export default function StatCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h4 className="text-sm text-gray-500">{title}</h4>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  )
}
