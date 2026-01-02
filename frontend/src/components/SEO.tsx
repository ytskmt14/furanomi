import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  /** ページタイトル（デフォルト: "ふらのみ - 近くの店舗の空き状況を確認"） */
  title?: string;
  /** ページ説明（デフォルト: "居酒屋・カフェ・レストランの空き状況をリアルタイムで確認。混雑状況を見てからお店を選べます。"） */
  description?: string;
  /** カノニカルURL（デフォルト: "https://furanomi.com"） */
  canonical?: string;
  /** OGP画像URL（デフォルト: "https://furanomi.com/OGP.png"） */
  ogImage?: string;
  /** noindex設定（デフォルト: false） */
  noindex?: boolean;
}

/**
 * SEOコンポーネント
 * ページごとのメタタグを動的に設定
 *
 * @example
 * ```tsx
 * <SEO
 *   title="マイプロフィール - ふらのみ"
 *   description="プロフィール情報の確認・編集"
 *   canonical="https://furanomi.com/user/profile"
 * />
 * ```
 */
export const SEO: React.FC<SEOProps> = ({
  title = 'ふらのみ - 近くの店舗の空き状況を確認',
  description = '居酒屋・カフェ・レストランの空き状況をリアルタイムで確認。混雑状況を見てからお店を選べます。',
  canonical = 'https://furanomi.com',
  ogImage = 'https://furanomi.com/OGP.png',
  noindex = false,
}) => {
  const fullTitle = title.includes('ふらのみ') ? title : `${title} - ふらのみ`;

  return (
    <Helmet>
      {/* 基本メタタグ */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* カノニカルURL */}
      <link rel="canonical" href={canonical} />

      {/* OGP設定 */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:alt" content="ふらのみロゴ" />
      <meta property="og:site_name" content="ふらのみ" />
      <meta property="og:locale" content="ja_JP" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

