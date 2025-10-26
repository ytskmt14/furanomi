export const Tutorial: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: '現在地を許可',
      description: 'アプリにアクセスして、位置情報の使用を許可してください。',
      image: '📍',
      detail: 'ブラウザの位置情報許可ダイアログが表示されたら「許可」をクリックします。'
    },
    {
      number: 2,
      title: '店舗を検索',
      description: '自動的に近くのお店が表示されます。カテゴリや空き状況でフィルタできます。',
      image: '🔍',
      detail: '検索ボタンをタップして、カテゴリ（居酒屋・カフェ・レストラン）や空き状況で絞り込めます。'
    },
    {
      number: 3,
      title: '空き状況を確認',
      description: 'お店のカードに空き状況が色分けして表示されます。',
      image: '🟢',
      detail: '緑：空きあり、黄：混雑、赤：満席、グレー：営業時間外で一目で分かります。'
    },
    {
      number: 4,
      title: 'お店に向かう',
      description: '気になるお店をタップして詳細を確認。地図で位置もチェックできます。',
      image: '🚶',
      detail: '営業時間や連絡先も確認できるので、安心してお店に向かえます。'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            サービスの使い方
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            「ふらのみ」を使えば、4つのステップで簡単にお店を見つけられます
          </p>
        </div>

        <div className="space-y-12">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex flex-col md:flex-row gap-6 items-center"
            >
              {/* ステップ番号とアイコン */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-5xl">{step.image}</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{step.number}</span>
                  </div>
                </div>
              </div>

              {/* 説明 */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-lg text-gray-700 mb-2">
                  {step.description}
                </p>
                <p className="text-sm text-gray-500">
                  {step.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

