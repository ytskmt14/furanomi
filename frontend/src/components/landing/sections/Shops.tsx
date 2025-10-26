import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/button';

export const Shops: React.FC = () => {
  const navigate = useNavigate();

  const categories = [
    { icon: '🍺', name: '居酒屋', count: 15 },
    { icon: '☕', name: 'カフェ', count: 8 },
    { icon: '🍽️', name: 'レストラン', count: 12 }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            参加店舗
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            様々なジャンルのお店が参加しています
          </p>
        </div>

        {/* カテゴリ別の店舗数 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="text-6xl mb-4">{category.icon}</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                {category.name}
              </h3>
              <p className="text-4xl font-bold text-blue-600">
                {category.count}
                <span className="text-lg text-gray-600 ml-2">店舗</span>
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-6">
            お近くの参加店舗を今すぐチェック
          </p>
          <Button
            size="lg"
            className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate('/user')}
          >
            参加店舗を見る
          </Button>
        </div>
      </div>
    </section>
  );
};

