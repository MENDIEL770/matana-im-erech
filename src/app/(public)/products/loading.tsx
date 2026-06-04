export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="bg-white border-b border-[#ECE8E2] py-14 px-6 text-center">
        <div className="h-3 w-16 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
        <div className="h-10 w-48 bg-gray-200 rounded mx-auto animate-pulse" />
      </div>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-[#ECE8E2] rounded-2xl animate-pulse"
              style={{ aspectRatio: "0.85" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
