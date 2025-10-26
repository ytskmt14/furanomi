export const Features: React.FC = () => {
  const features = [
    {
      icon: '📍',
      title: '現在地から検索',
      description: 'GPS機能で現在地から近いお店を自動検索。距離順でソートして表示します。'
    },
    {
      icon: '🟢',
      title: 'リアルタイム空き状況',
      description: 'お店の空き状況をリアルタイムで確認。空きあり・混雑・満席が一目で分かります。'
    },
    {
      icon: '🔍',
      title: 'カテゴリフィルタ',
      description: '居酒屋・カフェ・レストランなど、カテゴリや空き状況でお店を絞り込めます。'
    },
    {
      icon: '🗺️',
      title: '地図表示機能',
      description: 'リスト表示と地図表示を切り替え可能。お店の位置を視覚的に確認できます。'
    },
    {
      icon: '⏰',
      title: '営業時間自動判定',
      description: '営業時間を自動判定し、営業時間外のお店は分かりやすく表示します。'
    },
    {
      icon: '📱',
      title: 'レスポンシブ対応',
      description: 'スマホ・タブレット・PCどのデバイスでも快適に利用できます。'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            主な機能
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            ふらのみは、お店探しに必要な機能を全て備えています
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

