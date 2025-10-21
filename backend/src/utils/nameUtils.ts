// 名前関連のユーティリティ関数

/**
 * 姓と名を結合してフルネームを作成
 * @param last_name 姓
 * @param first_name 名
 * @param locale ロケール（'ja' | 'en'）
 * @returns フルネーム
 */
export function createFullName(
  last_name: string, 
  first_name: string, 
  locale: 'ja' | 'en' = 'ja'
): string {
  if (locale === 'ja') {
    return `${last_name} ${first_name}`;
  } else {
    return `${first_name} ${last_name}`;
  }
}

/**
 * フルネームを姓と名に分割
 * @param full_name フルネーム
 * @param locale ロケール（'ja' | 'en'）
 * @returns {last_name, first_name}
 */
export function parseFullName(
  full_name: string, 
  locale: 'ja' | 'en' = 'ja'
): { last_name: string; first_name: string } {
  const parts = full_name.trim().split(/\s+/);
  
  if (parts.length === 1) {
    // 1つの場合、姓として扱う
    return { last_name: parts[0], first_name: '' };
  }
  
  if (locale === 'ja') {
    // 日本語: 最初が姓、残りが名
    return {
      last_name: parts[0],
      first_name: parts.slice(1).join(' ')
    };
  } else {
    // 英語: 最後が姓、最初が名
    return {
      last_name: parts[parts.length - 1],
      first_name: parts.slice(0, -1).join(' ')
    };
  }
}

/**
 * 名前の表示形式を取得
 * @param last_name 姓
 * @param first_name 名
 * @param format 表示形式
 * @returns フォーマットされた名前
 */
export function formatName(
  last_name: string,
  first_name: string,
  format: 'full' | 'last' | 'first' | 'initials' = 'full'
): string {
  switch (format) {
    case 'full':
      return createFullName(last_name, first_name);
    case 'last':
      return last_name;
    case 'first':
      return first_name;
    case 'initials':
      return `${last_name.charAt(0)}${first_name.charAt(0)}`.toUpperCase();
    default:
      return createFullName(last_name, first_name);
  }
}

/**
 * 名前の検索用文字列を生成
 * @param last_name 姓
 * @param first_name 名
 * @returns 検索用文字列
 */
export function createSearchString(last_name: string, first_name: string): string {
  const full_name = createFullName(last_name, first_name);
  const reversed_name = createFullName(first_name, last_name);
  
  return `${last_name} ${first_name} ${full_name} ${reversed_name}`.toLowerCase();
}
