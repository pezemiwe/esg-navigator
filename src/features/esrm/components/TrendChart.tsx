const TrendChart = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const data = [25, 15, 30, 20, 35, 28];
  const maxValue = Math.max(...data);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Monthly Submissions Trend
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Submissions</span>
        </div>
      </div>

      <div className="relative h-64">
        <div className="absolute inset-0 flex items-end justify-between gap-2">
          {data.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="relative w-full bg-gray-100 rounded-t-lg overflow-hidden"
                style={{ height: "200px" }}
              >
                <div
                  className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-1000 ease-out hover:from-blue-600 hover:to-blue-500"
                  style={{
                    height: `${(value / maxValue) * 100}%`,
                    animationDelay: `${index * 100}ms`,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-white font-medium text-sm opacity-0 hover:opacity-100 transition-opacity">
                  {value}
                </div>
              </div>
              <span className="text-sm text-gray-600 mt-2 font-medium">
                {months[index]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendChart;
