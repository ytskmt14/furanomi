import { Button } from '../../ui/button';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

export const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* ロゴ */}
          <div className="flex justify-center mb-8">
            <img 
              src="/logo.svg" 
              alt="ふらのみロゴ" 
              className="w-24 h-24 md:w-32 md:h-32"
            />
          </div>

          {/* キャッチコピー */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            近くのお店の空き状況を
            <br />
            <span className="text-blue-600">リアルタイムで確認</span>
          </h1>

          {/* サービス説明 */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            「ふらのみ」は、現在地から近いお店の空き状況をすぐに確認できるサービスです。
            <br className="hidden md:block" />
            待ち時間なく、快適にお店を楽しめます。
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 shadow-lg"
              onClick={() => navigate('/user')}
            >
              <span className="inline-flex items-center gap-2">
                <Search className="w-5 h-5" /> 今すぐ使ってみる
              </span>
            </Button>
          </div>

          {/* 使い方ヒント */}
          <p className="mt-8 text-sm text-gray-500">
            位置情報の許可で、近くのお店がすぐに見つかります
          </p>
        </div>
      </div>

      {/* 装飾的な背景要素 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300 rounded-full filter blur-3xl"></div>
      </div>
    </section>
  );
};

