export const ServiceOverview: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            サービス概要
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            ふらのみを使えば、お店探しがもっと簡単に。
            空き状況をリアルタイムで確認して、スムーズに来店できます。
          </p>
        </div>

        {/* 利用の流れ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* ステップ1 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              📍 位置情報を許可
            </h3>
            <p className="text-gray-600">
              現在地から近いお店を自動で検索します
            </p>
          </div>

          {/* ステップ2 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              🔍 お店を検索
            </h3>
            <p className="text-gray-600">
              カテゴリや距離でお店をフィルタリング
            </p>
          </div>

          {/* ステップ3 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-blue-600">3</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ✅ 空き状況を確認
            </h3>
            <p className="text-gray-600">
              リアルタイムで空き状況をチェック
            </p>
          </div>

          {/* ステップ4 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-blue-600">4</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              🚶 お店に向かう
            </h3>
            <p className="text-gray-600">
              待ち時間なく快適に来店できます
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

