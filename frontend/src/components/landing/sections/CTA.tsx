import { Button } from '../../ui/button';
import { useNavigate } from 'react-router-dom';

export const CTA: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          今すぐ使ってみませんか？
        </h2>
        <p className="text-xl md:text-2xl mb-10 opacity-90">
          待ち時間なく、快適なお店体験を。
          <br className="hidden md:block" />
          ふらのみで、お店探しをもっとスマートに。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="text-lg px-10 py-6 bg-white text-blue-600 hover:bg-gray-100 shadow-lg"
            onClick={() => navigate('/user')}
          >
            🔍 アプリを使う
          </Button>
        </div>
        <p className="mt-8 text-sm opacity-75">
          無料で利用できます
        </p>
      </div>
    </section>
  );
};

