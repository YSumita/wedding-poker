import type { Card as CardType } from '../types/poker';
import { Card } from './Card';
import './PokerTable.css';

interface PokerTableProps {
  communityCards: (CardType | null)[];
  street: 'preflop' | 'flop' | 'turn' | 'river';
}

export function PokerTable({ communityCards, street }: PokerTableProps) {
  const revealedCount = street === 'preflop' ? 0 : street === 'flop' ? 3 : street === 'turn' ? 4 : 5;
  
  // 各カードがアニメーションすべきかどうかを判定
  // フロップ: 最初の3枚、ターン: 4枚目、リバー: 5枚目
  const shouldAnimate = (index: number) => {
    if (street === 'flop' && index < 3) return true;
    if (street === 'turn' && index === 3) return true;
    if (street === 'river' && index === 4) return true;
    return false;
  };

  // アニメーションの遅延を設定（フロップの3枚は順番に、ターンとリバーは個別に）
  const getAnimationDelay = (index: number) => {
    if (street === 'flop' && index < 3) {
      return index * 100; // フロップの3枚は100msずつ遅延
    }
    if (street === 'turn' && index === 3) {
      return 0;
    }
    if (street === 'river' && index === 4) {
      return 0;
    }
    return 0;
  };

  return (
    <div className="poker-table">
      <div className="table-surface">
        <div className="community-cards">
          {communityCards.map((card, index) => (
            <Card
              key={index}
              card={card}
              isRevealed={index < revealedCount}
              shouldAnimate={shouldAnimate(index)}
              animationDelay={getAnimationDelay(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


