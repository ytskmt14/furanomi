import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { apiService } from '../../services/api';

interface ShopManager {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  shop_id?: string;
  shop_name?: string;
}

export const ManagersManagement: React.FC = () => {
  const [managers, setManagers] = useState<ShopManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<ShopManager | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // フォーム状態
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    is_active: true
  });

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const managersData = await apiService.getShopManagers();
      setManagers(managersData);
    } catch (err) {
      console.error('Failed to fetch managers:', err);
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManager = () => {
    setEditingManager(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      is_active: true
    });
    setIsModalOpen(true);
  };

  const handleEditManager = (manager: ShopManager) => {
    setEditingManager(manager);
    setFormData({
      username: manager.username,
      email: manager.email,
      password: '', // 編集時はパスワードを空にする
      first_name: manager.first_name,
      last_name: manager.last_name,
      phone: manager.phone || '',
      is_active: manager.is_active
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingManager) {
        // 編集時はパスワードが空の場合は除外
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await apiService.updateShopManager(editingManager.id, updateData);
      } else {
        await apiService.createShopManager(formData);
      }

      setIsModalOpen(false);
      await fetchManagers();
    } catch (err) {
      console.error('Failed to save manager:', err);
      setError('保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteManager = async (managerId: string) => {
    if (!confirm('この店舗管理者を削除しますか？')) return;

    try {
      await apiService.deleteShopManager(managerId);
      await fetchManagers();
    } catch (err) {
      console.error('Failed to delete manager:', err);
      setError('削除に失敗しました');
    }
  };

  const handleToggleActive = async (managerId: string, currentStatus: boolean) => {
    try {
      await apiService.updateShopManager(managerId, { is_active: !currentStatus });
      await fetchManagers();
    } catch (err) {
      console.error('Failed to toggle active status:', err);
      setError('ステータスの更新に失敗しました');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4 px-4 py-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">店舗管理者管理</h1>
          <p className="mt-1 text-sm text-gray-600">
            店舗管理者アカウントの作成・編集・削除を行います
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 py-6">
      {/* ページタイトル */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">店舗管理者管理</h1>
          <p className="mt-1 text-sm text-gray-600">
            店舗管理者アカウントの作成・編集・削除を行います
          </p>
        </div>
        <Button onClick={handleCreateManager} className="bg-red-600 hover:bg-red-700 text-sm px-3 py-2">
          新規作成
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* 管理者一覧 - モバイルファーストデザイン */}
      <div className="space-y-3">
        {managers.map((manager) => (
          <Card key={manager.id} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {manager.first_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">
                      {manager.first_name} {manager.last_name}
                    </h3>
                    <p className="text-xs text-gray-500">@{manager.username}</p>
                  </div>
                </div>
                <Badge className={manager.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {manager.is_active ? 'アクティブ' : '無効'}
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start">
                  <span className="w-12 text-gray-500">メール:</span>
                  <span className="flex-1">{manager.email}</span>
                </div>
                {manager.phone && (
                  <div className="flex items-start">
                    <span className="w-12 text-gray-500">電話:</span>
                    <span className="flex-1">{manager.phone}</span>
                  </div>
                )}
                <div className="flex items-start">
                  <span className="w-12 text-gray-500">店舗:</span>
                  <span className="flex-1">
                    {manager.shop_name ? (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {manager.shop_name}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">未設定</span>
                    )}
                  </span>
                </div>
                {manager.last_login_at && (
                  <div className="flex items-start">
                    <span className="w-12 text-gray-500">最終:</span>
                    <span className="flex-1 text-xs">{formatDate(manager.last_login_at)}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditManager(manager)}
                  className="flex-1 text-xs"
                >
                  編集
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(manager.id, manager.is_active)}
                  className={`flex-1 text-xs ${
                    manager.is_active 
                      ? 'text-orange-600 hover:text-orange-700' 
                      : 'text-green-600 hover:text-green-700'
                  }`}
                >
                  {manager.is_active ? '無効化' : '有効化'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteManager(manager.id)}
                  className="flex-1 text-red-600 hover:text-red-700 text-xs"
                >
                  削除
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center p-0 md:p-4 z-50">
          <div className="bg-white rounded-t-lg md:rounded-lg w-full md:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {editingManager ? '店舗管理者編集' : '新規店舗管理者作成'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">ユーザー名 *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">メールアドレス *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">
                    パスワード {editingManager ? '(変更する場合のみ)' : '*'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingManager}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">名前 *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">姓 *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">電話番号</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="is_active" className="text-sm">
                    アカウントを有効にする
                  </Label>
                </div>

                {/* ボタン */}
                <div className="flex flex-col space-y-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {isSubmitting ? '保存中...' : '保存'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full"
                  >
                    キャンセル
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
