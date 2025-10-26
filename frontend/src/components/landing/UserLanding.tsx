import { useEffect } from 'react';
import { Hero } from './sections/Hero';
import { Features } from './sections/Features';
import { Tutorial } from './sections/Tutorial';
import { CTA } from './sections/CTA';
import { useNavigate } from 'react-router-dom';

export const UserLanding: React.FC = () => {
  const navigate = useNavigate();

  // SEO対策：タイトルとメタタグの設定
  useEffect(() => {
    document.title = 'ふらのみ - 近くのお店の空き状況をリアルタイムで確認';
    
    // メタタグの設定
    const setMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    setMetaTag('description', 'ふらのみは、現在地から近いお店の空き状況をリアルタイムで確認できるサービスです。待ち時間なく、快適にお店を楽しめます。');
    setMetaTag('keywords', 'ふらのみ,空き状況,飲食店,レストラン,カフェ,居酒屋,リアルタイム,検索,福岡');
    
    // Open Graph
    setMetaTag('og:type', 'website', true);
    setMetaTag('og:title', 'ふらのみ - 近くのお店の空き状況をリアルタイムで確認', true);
    setMetaTag('og:description', '現在地から近いお店の空き状況をリアルタイムで確認。待ち時間なく、快適にお店を楽しめます。', true);
    setMetaTag('og:image', '/logo.svg', true);
    
    // Twitter
    setMetaTag('twitter:card', 'summary_large_image', true);
    setMetaTag('twitter:title', 'ふらのみ - 近くのお店の空き状況をリアルタイムで確認', true);
    setMetaTag('twitter:description', '現在地から近いお店の空き状況をリアルタイムで確認。待ち時間なく、快適にお店を楽しめます。', true);
  }, []);

  return (
    <>

      <div className="min-h-screen bg-white">
        {/* ヘッダー */}
        <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/lp')}>
                <img src="/logo.svg" alt="ふらのみ" className="w-8 h-8" />
                <span className="text-xl font-bold text-gray-900">ふらのみ</span>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <a href="#features" className="text-gray-600 hover:text-gray-900">機能</a>
                <a href="#tutorial" className="text-gray-600 hover:text-gray-900">使い方</a>
                <a href="#shops" className="text-gray-600 hover:text-gray-900">参加店舗</a>
                <button
                  onClick={() => navigate('/user')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  アプリを使う
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="pt-16">
          <Hero />
          <div id="features">
            <Features />
          </div>
          <div id="tutorial">
            <Tutorial />
          </div>
          <CTA />
        </main>

        {/* フッター */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              {/* ロゴとキャッチコピー */}
              <div className="flex items-center gap-3">
                <img src="/logo.svg" alt="ふらのみ" className="w-8 h-8" />
                <div>
                  <span className="text-xl font-bold block">ふらのみ</span>
                  <p className="text-gray-400 text-sm">
                    お店の空き状況をリアルタイムで確認
                  </p>
                </div>
              </div>

              {/* アプリリンク */}
              <div>
                <button
                  onClick={() => navigate('/user')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  アプリを使う
                </button>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
              <p>&copy; 2025 ふらのみ. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default UserLanding;

