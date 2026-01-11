import type { PlayerHandInfo } from '../types/poker';
import { Card } from './Card';
import { groupHandsByValue } from '../utils/handFormatter';
import './Top3Hands.css';

interface Top3HandsProps {
  hands: PlayerHandInfo[];
}

export function Top3Hands({ hands }: Top3HandsProps) {
  if (hands.length === 0) {
    return null;
  }

  const rankColors: Record<string, string> = {
    'Royal Flush': '#ff6b6b',
    'Straight Flush': '#4ecdc4',
    'Four of a Kind': '#45b7d1',
    'Full House': '#96ceb4',
    'Flush': '#ffeaa7',
    'Straight': '#fdcb6e',
    'Three of a Kind': '#e17055',
    'Two Pair': '#a29bfe',
    'Pair': '#fd79a8',
    'High Card': '#dfe6e9'
  };

  // 同じ強さのハンドをグループ化
  const groupedHands = groupHandsByValue(hands);
  // Top4のグループを取得（最大4つまで表示）
  const topGroups = groupedHands.slice(0, 4);

  return (
    <div className="top3-hands">
      <h2>Top Hands</h2>
      <div className="hands-list">
        {topGroups.map((group, groupIndex) => {
          const hand = group.hands[0].bestHand;
          return (
            <div key={groupIndex} className="hand-item">
              <div className="hand-rank-badge" style={{ backgroundColor: rankColors[hand.rank] || '#ccc' }}>
                #{groupIndex + 1}
              </div>
              <div className="hand-info">
                <div className="hand-rank">{hand.rank}</div>
                <div className="hand-description">{hand.description}</div>
                <div className="hand-display-text">{group.displayText}</div>
                
                {group.hands.length > 1 && (
                  <div className="hand-count-info">
                    （{group.hands.length}通りの組み合わせ）
                  </div>
                )}
                
                <div className="hand-section">
                  <div className="hand-section-label">プレイヤーのハンド（2枚）</div>
                  <div className="hand-cards">
                    {group.hands[0].playerCards.map((card, cardIndex) => (
                      <Card key={cardIndex} card={card} isRevealed={true} />
                    ))}
                  </div>
                </div>

                <div className="hand-section">
                  <div className="hand-section-label">役を構成するカード（5枚）</div>
                  <div className="hand-cards">
                    {hand.cards.map((card, cardIndex) => (
                      <Card key={cardIndex} card={card} isRevealed={true} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


