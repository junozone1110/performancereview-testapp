'use client';

import { useState, useEffect } from 'react';
import { Button, Textfield } from '@giftee/abukuma-react';
import type { Goal, GoalFormData } from '@/types/evaluation';

interface GoalFormProps {
  goal?: Goal | null;
  onSubmit: (data: GoalFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function GoalForm({ goal, onSubmit, onCancel, isLoading = false }: GoalFormProps) {
  const [formData, setFormData] = useState<GoalFormData>({
    title: '',
    description: '',
    achievementCriteria: '',
    weight: 20,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof GoalFormData, string>>>({});

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        description: goal.description || '',
        achievementCriteria: goal.achievementCriteria || '',
        weight: goal.weight,
      });
    }
  }, [goal]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof GoalFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = '目標概要は必須です';
    }

    if (formData.weight < 1 || formData.weight > 40) {
      newErrors.weight = 'ウェイトは1%〜40%の範囲で設定してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div
      className="ab-bg-base ab-rounded-md ab-p-6"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        zIndex: 1000,
      }}
    >
      <h2 className="ab-text-heading-m ab-text-default ab-mb-4">
        {goal ? '目標を編集' : '目標を追加'}
      </h2>

      <form onSubmit={handleSubmit} className="ab-flex ab-flex-column ab-gap-4">
        <div>
          <Textfield
            label="目標概要"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="目標の概要を入力してください"
            disabled={isLoading}
          />
          {errors.title && (
            <p className="ab-text-body-s ab-mt-1" style={{ color: '#f44336' }}>
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <label className="ab-text-body-s ab-text-secondary ab-mb-1" style={{ display: 'block' }}>
            目標詳細
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="目標の詳細を入力してください"
            disabled={isLoading}
            className="ab-text-body-m"
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div>
          <label className="ab-text-body-s ab-text-secondary ab-mb-1" style={{ display: 'block' }}>
            達成基準
          </label>
          <textarea
            value={formData.achievementCriteria}
            onChange={(e) => setFormData({ ...formData, achievementCriteria: e.target.value })}
            placeholder="達成基準を入力してください"
            disabled={isLoading}
            className="ab-text-body-m"
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div>
          <label className="ab-text-body-s ab-text-secondary ab-mb-1" style={{ display: 'block' }}>
            ウェイト (%)
          </label>
          <input
            type="number"
            value={formData.weight}
            onChange={(e) =>
              setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })
            }
            min={1}
            max={40}
            disabled={isLoading}
            className="ab-text-body-m"
            style={{
              width: '100px',
              padding: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
            }}
          />
          {errors.weight && (
            <p className="ab-text-body-s ab-mt-1" style={{ color: '#f44336' }}>
              {errors.weight}
            </p>
          )}
          <p className="ab-text-body-s ab-text-secondary ab-mt-1">
            1目標あたり最大40%まで設定できます
          </p>
        </div>

        <div className="ab-flex ab-gap-2 ab-justify-end ab-mt-4">
          <Button variant="outlined" onClick={onCancel} disabled={isLoading}>
            キャンセル
          </Button>
          <Button type="submit" variant="default" disabled={isLoading}>
            {isLoading ? '保存中...' : goal ? '更新' : '追加'}
          </Button>
        </div>
      </form>
    </div>
  );
}

// オーバーレイ
export function GoalFormOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999,
      }}
    />
  );
}
