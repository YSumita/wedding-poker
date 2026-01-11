import type { PlayerHandInfo } from '../types/poker';
import { Card } from './Card';
import { formatHandDisplay } from '../utils/handFormatter';
import './HandHistory.css';

interface HandHistoryProps {
  hands: PlayerHandInfo[];
  currentIndex: number;
}

export function HandHistory({ hands, currentIndex }: HandHistoryProps) {
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

  // 0からcurrentIndexまでのハンドを表示
  const displayedHands = hands.slice(0, currentIndex + 1);

  // 過去のハンドと現在のハンドを分離
  const previousHands = displayedHands.slice(0, currentIndex);
  const currentHand = displayedHands[currentIndex];

  return (
    <div className="hand-history">
      <div className="hand-history-container">
        {/* 過去のハンドを左側に表示 */}
        <div className="previous-hands-group">
          {previousHands.map((hand, index) => {
            const displayText = formatHandDisplay(hand.playerCards);
            const handRank = hand.bestHand;
            
            return (
              <div key={index} className="hand-item previous">
                <div className="hand-rank-badge" style={{ backgroundColor: rankColors[handRank.rank] || '#ccc' }}>
                  #{index + 1}
                </div>
                <div className="hand-info">
                  <div className="hand-rank">{handRank.rank}</div>
                  <div className="hand-description">{handRank.description}</div>
                  <div className="hand-display-text">{displayText}</div>
                  
                  <div className="hand-section">
                    <div className="hand-section-label">プレイヤーのハンド（2枚）</div>
                    <div className="hand-cards">
                      {hand.playerCards.map((card, cardIndex) => (
                        <Card key={cardIndex} card={card} isRevealed={true} />
                      ))}
                    </div>
                  </div>

                  <div className="hand-section">
                    <div className="hand-section-label">役を構成するカード（5枚）</div>
                    <div className="hand-cards">
                      {handRank.cards.map((card, cardIndex) => (
                        <Card key={cardIndex} card={card} isRevealed={true} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 現在のハンドを中央に表示 */}
        {currentHand && (() => {
          const displayText = formatHandDisplay(currentHand.playerCards);
          const handRank = currentHand.bestHand;
          
          return (
            <div className="hand-item current">
              <div className="hand-rank-badge" style={{ backgroundColor: rankColors[handRank.rank] || '#ccc' }}>
                #{currentIndex + 1}
              </div>
              <div className="hand-info">
                <div className="hand-rank">{handRank.rank}</div>
                <div className="hand-description">{handRank.description}</div>
                <div className="hand-display-text">{displayText}</div>
                
                <div className="hand-section">
                  <div className="hand-section-label">プレイヤーのハンド（2枚）</div>
                  <div className="hand-cards">
                    {currentHand.playerCards.map((card, cardIndex) => (
                      <Card key={cardIndex} card={card} isRevealed={true} />
                    ))}
                  </div>
                </div>

                <div className="hand-section">
                  <div className="hand-section-label">役を構成するカード（5枚）</div>
                  <div className="hand-cards">
                    {handRank.cards.map((card, cardIndex) => (
                      <Card key={cardIndex} card={card} isRevealed={true} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}