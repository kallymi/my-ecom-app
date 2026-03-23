import useCountdown from "../../hooks/useCountdown";

export default function PromoCountdown({ endDate }) {
  const countdown = useCountdown(endDate);

  if (!countdown) {
    return (
      <div className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 font-bold text-center">
        🔥 Promotion terminée
      </div>
    );
  }

  const { days, hours, minutes, seconds, total } = countdown;

  const totalDuration =
    new Date(endDate).getTime() - new Date().getTime() + total;

  const progress = Math.max(
    0,
    (total / totalDuration) * 100
  );

  return (
    <div className="mt-6 p-6 rounded-3xl bg-gradient-to-br from-black to-gray-900 text-white shadow-xl">

      {/* Title */}
      <div className="text-xs uppercase tracking-widest text-gray-400 mb-4">
        Fin de la promotion
      </div>

      {/* Timer Boxes */}
      <div className="flex justify-between gap-3">
        {[
          { label: "Jours", value: days },
          { label: "Heures", value: hours },
          { label: "Min", value: minutes },
          { label: "Sec", value: seconds },
        ].map((item) => (
          <div
            key={item.label}
            className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl py-4 text-center"
          >
            <div className="text-2xl font-extrabold">
              {String(item.value).padStart(2, "0")}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-gray-300 mt-1">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-6 h-2 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}