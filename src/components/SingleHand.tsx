import type { PlayerHandInfo, Card } from '../types/poker';
import { Card as CardComponent } from './Card';
import { formatHandDisplay } from '../utils/handFormatter';
import './SingleHand.css';

interface SingleHandProps {
  hand: PlayerHandInfo;
  rank: number;
}

export function SingleHand({ hand, rank }: SingleHandProps) {
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

  // カスタムdisplayTextがあればそれを使用、なければ通常のフォーマット
  const customDisplayText = (hand as any).displayText;
  const displayText = customDisplayText || formatHandDisplay(hand.playerCards);
  const handRank = hand.bestHand;
  
  // フルハウスの場合、代替プレイヤーハンドを取得
  const alternativePlayerCards = (hand as any).alternativePlayerCards as Card[][] | undefined;
  const allPlayerCards = alternativePlayerCards 
    ? [hand.playerCards, ...alternativePlayerCards]
    : [hand.playerCards];

  return (
    <div className="single-hand">
      <div className="hand-item">
        <div className="hand-rank-badge" style={{ backgroundColor: rankColors[handRank.rank] || '#ccc' }}>
          #{rank}
        </div>
        <div className="hand-info">
          <div className="hand-rank">{handRank.rank}</div>
          <div className="hand-description">{handRank.description}</div>
          <div className="hand-display-text">{displayText}</div>
          
          <div className="hand-section">
            <div className="hand-section-label">プレイヤーのハンド（2枚）</div>
            <div className="hand-cards">
              {allPlayerCards.map((playerCards, cardsIndex) => {
                // カスタム表示用のプロパティを取得
                const customDisplay = (hand as any).displayText;
                const showXdXd = customDisplay === 'XdXd' && cardsIndex === 0; // #2の場合、XdXd表示
                const showSuitX = (customDisplay === '9x6x' || customDisplay === '6x5x') && cardsIndex === 0; // #3の場合、スーツをx
                const show8x8x = customDisplay === '8x8x' && cardsIndex === 0; // #5の場合、スーツをx
                const showKxKx = customDisplay === 'KxKx' && cardsIndex === 0; // #4の場合、スーツをx
                
                return (
                  <div key={cardsIndex} className="player-hand-group">
                    {playerCards.map((card, cardIndex) => {
                      let displayCard = { ...card };
                      // #2の場合、両方ともXd（ランクX）に
                      if (showXdXd) {
                        displayCard = { ...card, rank: 'X' } as unknown as Card;
                      }
                      // #3の場合、スーツをxに
                      if (showSuitX) {
                        displayCard = { ...card, suit: 'x' as any };
                      }
                      // #5の場合、スーツをxに
                      if (show8x8x) {
                        displayCard = { ...card, suit: 'x' as any };
                      }
                      // #4の場合、スーツをxに
                      if (showKxKx) {
                        displayCard = { ...card, suit: 'x' as any };
                      }
                      return <CardComponent key={cardIndex} card={displayCard} isRevealed={true} />;
                    })}
                    {cardsIndex < allPlayerCards.length - 1 && (
                      <span className="hand-separator">or</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="hand-section">
            <div className="hand-section-label">役を構成するカード（5枚）</div>
            <div className="hand-cards">
              {((hand as any).bestHandCardsDisplay || handRank.cards).map((card: Card, cardIndex: number) => (
                <CardComponent key={cardIndex} card={card} isRevealed={true} />
              ))}
            </div>
          </div>
          
          {/* Xの説明を追加 */}
          {displayText && (displayText.includes('X') || displayText.includes('x')) && (
            <div className="hand-x-explanation" style={{ marginTop: '12px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', fontStyle: 'italic' }}>
              ※{displayText.includes('X') ? 'X' : 'x'}は任意の{displayText.includes('Xd') || displayText.includes('XD') ? '数字' : 'マーク'}を表します
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
