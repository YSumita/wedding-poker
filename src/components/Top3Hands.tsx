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
  // Top5のグループを取得（最大5つまで表示）
  const topGroups = groupedHands.slice(0, 5);

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
                    {(() => {
                      const hand = group.hands[0];
                      const alternativePlayerCards = (hand as any).alternativePlayerCards as any[] | undefined;
                      const allPlayerCards = alternativePlayerCards 
                        ? [hand.playerCards, ...alternativePlayerCards]
                        : [hand.playerCards];
                      const customDisplay = (hand as any).displayText;
                      const showXdXd = customDisplay === 'XdXd';
                      const showSuitX = customDisplay === '9x6x' || customDisplay === '6x5x' || customDisplay === '8x8x' || customDisplay === 'KxKx';
                      
                      return allPlayerCards.map((playerCards, cardsIndex) => (
                        <div key={cardsIndex} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {playerCards.map((card: any, cardIndex: number) => {
                            let displayCard = { ...card };
                            if (showXdXd) {
                              displayCard = { ...card, rank: 'X' };
                            }
                            if (showSuitX) {
                              displayCard = { ...card, suit: 'x' as any };
                            }
                            return <Card key={cardIndex} card={displayCard} isRevealed={true} />;
                          })}
                          {cardsIndex < allPlayerCards.length - 1 && (
                            <span style={{ color: 'rgba(255, 255, 255, 0.8)', margin: '0 8px', fontWeight: 'bold' }}>or</span>
                          )}
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                <div className="hand-section">
                  <div className="hand-section-label">役を構成するカード（5枚）</div>
                  <div className="hand-cards">
                    {(() => {
                      const hand = group.hands[0];
                      const bestHandCardsDisplay = (hand as any).bestHandCardsDisplay;
                      const cardsToDisplay = bestHandCardsDisplay || hand.cards;
                      return cardsToDisplay.map((card: any, cardIndex: number) => (
                        <Card key={cardIndex} card={card} isRevealed={true} />
                      ));
                    })()}
                  </div>
                </div>
                {/* Xの説明を追加 */}
                {group.displayText && (group.displayText.includes('X') || group.displayText.includes('x')) && (
                  <div className="hand-x-explanation" style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', fontStyle: 'italic' }}>
                    ※{group.displayText.includes('X') ? 'X' : 'x'}は任意の{group.displayText.includes('Xd') || group.displayText.includes('XD') ? '数字' : 'マーク'}を表します
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


