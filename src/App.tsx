import { useState, useMemo, useEffect, useRef } from 'react';
import type { Card as CardType, Street, PlayerHandInfo } from './types/poker';
import { PokerTable } from './components/PokerTable';
import { Top3Hands } from './components/Top3Hands';
import { SingleHand } from './components/SingleHand';
import { Prize } from './components/Prize';
import './App.css';

function App() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [street, setStreet] = useState<Street>('preflop');
  const [communityCards, setCommunityCards] = useState<(CardType | null)[]>(Array(5).fill(null));
  const [isInitialized, setIsInitialized] = useState(false);
  const [showTopHand, setShowTopHand] = useState(false);
  const [currentHandIndex, setCurrentHandIndex] = useState(-1);
  const [showPrize, setShowPrize] = useState(false);
  const [currentPrizeRank, setCurrentPrizeRank] = useState(1);

  // BGMを初期化して自動再生
  useEffect(() => {
    audioRef.current = new Audio('/casino_bgm.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3; // 音量を調整（0.0-1.0）
    
    // ユーザーインタラクション後に再生を開始
    const playAudio = async () => {
      try {
        await audioRef.current?.play();
      } catch (error) {
        console.log('BGM再生エラー:', error);
      }
    };

    // 初回のユーザーインタラクションを待つ
    const handleFirstInteraction = () => {
      playAudio();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    // クリーンアップ
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  // 新しいゲームを開始
  const startNewGame = () => {
    try {
      // コミュニティカードを固定値に設定
      // フロップ: 8♦, 7♦, 2♠
      // ターン: K♠
      // リバー: 4♦
      const fixedCommunityCards: CardType[] = [
        { suit: '♦', rank: '8' },  // 8d
        { suit: '♦', rank: '7' },  // 7d
        { suit: '♠', rank: '2' },  // 2s
        { suit: '♠', rank: 'K' },  // Ks
        { suit: '♦', rank: '4' },  // 4d
      ];
      setCommunityCards(fixedCommunityCards);
      setStreet('preflop');
      setIsInitialized(true);
      setShowTopHand(false);
      setCurrentHandIndex(-1);
      setShowPrize(false);
      setCurrentPrizeRank(1);
    } catch (error) {
      console.error('Error starting new game:', error);
    }
  };

  // 次のストリートに進む
  const nextStreet = () => {
    if (street === 'preflop') {
      setStreet('flop');
    } else if (street === 'flop') {
      setStreet('turn');
    } else if (street === 'turn') {
      setStreet('river');
    }
  };

  // リバーの時のTop4ハンドを固定値で設定
  // ボード: 8♦, 7♦, 2♠, K♠, 5♦
  // 1. 4♦6♦ - ストレートフラッシュ
  // 2. A♦T♦ - フラッシュ
  // 3. 6♣9♣ - ストレート
  // 4. K♣K♦ - スリーカード
  const top3Hands = useMemo(() => {
    if (street !== 'river') {
      return [];
    }

    try {
      const revealedCards = communityCards.filter(card => card !== null) as CardType[];
      
      if (revealedCards.length === 0) {
        return [];
      }

      // 1. 6♦5♦ - ストレートフラッシュ（4♦, 5♦, 6♦, 7♦, 8♦）
      const hand1Player: CardType[] = [
        { suit: '♦', rank: '6' },
        { suit: '♦', rank: '5' }
      ];
      const hand1Best: CardType[] = [
        { suit: '♦', rank: '8' },
        { suit: '♦', rank: '7' },
        { suit: '♦', rank: '6' },
        { suit: '♦', rank: '5' },
        { suit: '♦', rank: '4' }
      ];
      const straightFlush: PlayerHandInfo = {
        playerCards: hand1Player,
        bestHand: {
          cards: hand1Best,
          rank: 'Straight Flush',
          value: 8000000 + 8, // 8-high
          description: 'Straight Flush'
        },
        communityCardsUsed: [
          { suit: '♦', rank: '8' },
          { suit: '♦', rank: '7' },
          { suit: '♦', rank: '4' }
        ]
      };
      
      // 2. X♦Y♦ (X, Yは任意の数字) - フラッシュ（X♦, Y♦, 8♦, 7♦, 4♦）
      const hand2Player: CardType[] = [
        { suit: '♦', rank: 'A' },
        { suit: '♦', rank: '10' }
      ];
      const hand2Best: CardType[] = [
        { suit: '♦', rank: 'A' },
        { suit: '♦', rank: '10' },
        { suit: '♦', rank: '8' },
        { suit: '♦', rank: '7' },
        { suit: '♦', rank: '4' }
      ];
      const flush: PlayerHandInfo = {
        playerCards: hand2Player,
        bestHand: {
          cards: hand2Best,
          rank: 'Flush',
          value: 5000000 + 14 * 537824 + 10 * 38416 + 8 * 2744 + 7 * 196 + 4 * 14, // A-highフラッシュ
          description: 'Flush'
        },
        communityCardsUsed: [
          { suit: '♦', rank: '8' },
          { suit: '♦', rank: '7' },
          { suit: '♦', rank: '4' }
        ]
      } as PlayerHandInfo & { displayText?: string; bestHandCardsDisplay?: CardType[] };
      (flush as any).displayText = 'XdXd';
      // 役を構成するカードをXdXd8d7d4dとして表示（最初の2枚をXdXdに）
      (flush as any).bestHandCardsDisplay = [
        { suit: '♦', rank: 'X' },
        { suit: '♦', rank: 'X' },
        { suit: '♦', rank: '8' },
        { suit: '♦', rank: '7' },
        { suit: '♦', rank: '4' }
      ];
      
      // 3. 6x5x (xは任意のマーク) - ストレート（6x, 5x, 4♦, 7♦, 8♦）
      const hand3Player: CardType[] = [
        { suit: '♣', rank: '6' },
        { suit: '♣', rank: '5' }
      ];
      const hand3Best: CardType[] = [
        { suit: '♦', rank: '8' },
        { suit: '♦', rank: '7' },
        { suit: '♣', rank: '6' },
        { suit: '♣', rank: '5' },
        { suit: '♦', rank: '4' }
      ];
      const straight: PlayerHandInfo = {
        playerCards: hand3Player,
        bestHand: {
          cards: hand3Best,
          rank: 'Straight',
          value: 4000000 + 8, // 8-high
          description: 'Straight, 8 high'
        },
        communityCardsUsed: [
          { suit: '♦', rank: '8' },
          { suit: '♦', rank: '7' },
          { suit: '♦', rank: '4' }
        ]
      } as PlayerHandInfo & { displayText?: string; bestHandCardsDisplay?: CardType[] };
      (straight as any).displayText = '6x5x';
      // 役を構成するカードを87654の順で表示（6と5のマークをxに）
      (straight as any).bestHandCardsDisplay = [
        { suit: '♦', rank: '8' },
        { suit: '♦', rank: '7' },
        { suit: 'x' as any, rank: '6' },
        { suit: 'x' as any, rank: '5' },
        { suit: '♦', rank: '4' }
      ];

      // 4. K♣K♦ - スリーカード（K♣, K♦, K♠）
      const hand4Player: CardType[] = [
        { suit: '♣', rank: 'K' },
        { suit: '♦', rank: 'K' }
      ];
      const hand4Best: CardType[] = [
        { suit: '♣', rank: 'K' },
        { suit: '♦', rank: 'K' },
        { suit: '♠', rank: 'K' },
        { suit: '♦', rank: '8' }, // キッカー
        { suit: '♦', rank: '7' }  // キッカー
      ];
      const threeOfAKindK: PlayerHandInfo = {
        playerCards: hand4Player,
        bestHand: {
          cards: hand4Best,
          rank: 'Three of a Kind',
          value: 3000000 + 13 * 14 * 14 + 8 * 14 + 7, // Kのスリーカード + 8,7キッカー
          description: 'Three of a Kind, Ks'
        },
        communityCardsUsed: [
          { suit: '♠', rank: 'K' },
          { suit: '♦', rank: '8' },
          { suit: '♦', rank: '7' }
        ]
      } as PlayerHandInfo & { displayText?: string; bestHandCardsDisplay?: CardType[] };
      (threeOfAKindK as any).displayText = 'KxKx';
      // プレイヤーのハンドと役を構成するカードで、K♣K♦をKxKxとして表示
      (threeOfAKindK as any).bestHandCardsDisplay = [
        { suit: 'x' as any, rank: 'K' },
        { suit: 'x' as any, rank: 'K' },
        { suit: '♠', rank: 'K' },
        { suit: '♦', rank: '8' },
        { suit: '♦', rank: '7' }
      ];

      // 5. 8x8x - スリーカード（8♠, 8♦, 8♣）
      const hand5Player: CardType[] = [
        { suit: '♠', rank: '8' },
        { suit: '♦', rank: '8' }
      ];
      const hand5Best: CardType[] = [
        { suit: '♠', rank: '8' },
        { suit: '♦', rank: '8' },
        { suit: '♣', rank: '8' },
        { suit: '♠', rank: 'K' }, // キッカー
        { suit: '♦', rank: '7' }  // キッカー
      ];
      const threeOfAKind8: PlayerHandInfo = {
        playerCards: hand5Player,
        bestHand: {
          cards: hand5Best,
          rank: 'Three of a Kind',
          value: 3000000 + 8 * 14 * 14 + 13 * 14 + 7, // 8のスリーカード + K,7キッカー
          description: 'Three of a Kind, 8s'
        },
        communityCardsUsed: [
          { suit: '♣', rank: '8' },
          { suit: '♠', rank: 'K' },
          { suit: '♦', rank: '7' }
        ]
      } as PlayerHandInfo & { displayText?: string; bestHandCardsDisplay?: CardType[] };
      (threeOfAKind8 as any).displayText = '8x8x';
      // 役を構成するカードで、8♠と8♣のマークをxに
      (threeOfAKind8 as any).bestHandCardsDisplay = [
        { suit: 'x' as any, rank: '8' },
        { suit: '♦', rank: '8' },
        { suit: 'x' as any, rank: '8' },
        { suit: '♠', rank: 'K' },
        { suit: '♦', rank: '7' }
      ];

      return [straightFlush, flush, straight, threeOfAKindK, threeOfAKind8];
    } catch (error) {
      console.error('Error calculating top 3 hands:', error);
      return [];
    }
  }, [street, communityCards]);

  // Tophandsボタンのクリック処理
  const handleTopHandsClick = () => {
    if (top3Hands.length === 0) return;
    
    // 次のハンドを表示（#1から順番に）
    const nextIndex = (currentHandIndex + 1) % top3Hands.length;
    setCurrentHandIndex(nextIndex);
    setShowTopHand(true);
    
    // 強いハンド表示と同時にstrong hand.mp3を再生
    const strongHandSound = new Audio('/strong%20hand.mp3');
    strongHandSound.volume = 0.5;
    strongHandSound.play().catch(() => {});
  };

  // Prizeボタンのクリック処理（各賞品用）
  const handlePrizeClick = (rank: number) => {
    if (showPrize && currentPrizeRank === rank) {
      // 同じ賞品のボタンがクリックされた場合は閉じる
      setShowPrize(false);
    } else {
      // 選択された賞品を表示
      setCurrentPrizeRank(rank);
      setShowPrize(true);
    }
  };

  // Prizeモーダルを閉じる
  const closePrize = () => {
    setShowPrize(false);
  };

  return (
    <div className="app">
      <div className="app-container">
        <h1>Poker Chance</h1>
        
        <div className="controls">
          <button onClick={startNewGame} className="btn btn-primary">
            New Game
          </button>
          {isInitialized && (
            <button 
              onClick={nextStreet} 
              className="btn btn-secondary"
              disabled={street === 'river'}
            >
              {street === 'preflop' && 'Show Flop'}
              {street === 'flop' && 'Show Turn'}
              {street === 'turn' && 'Show River'}
              {street === 'river' && 'River Complete'}
            </button>
          )}
        </div>

        {isInitialized && (
          <>
            <div className="street-indicator">
              <div className={`street-badge ${street === 'preflop' ? 'active' : ''}`}>Preflop</div>
              <div className={`street-badge ${street === 'flop' ? 'active' : ''}`}>Flop</div>
              <div className={`street-badge ${street === 'turn' ? 'active' : ''}`}>Turn</div>
              <div className={`street-badge ${street === 'river' ? 'active' : ''}`}>River</div>
            </div>

            <PokerTable communityCards={communityCards} street={street} />

            {street === 'river' && (
              <div className="river-buttons">
                <button onClick={handleTopHandsClick} className="btn btn-river btn-tophands">
                  {currentHandIndex < 0 ? 'Top Hands' : 'Next Top Hands'}
                </button>
                <div className="prize-buttons">
                  <button 
                    onClick={() => handlePrizeClick(1)} 
                    className={`btn btn-prize btn-prize-1st ${showPrize && currentPrizeRank === 1 ? 'active' : ''}`}
                  >
                    1st Prize
                  </button>
                  <button 
                    onClick={() => handlePrizeClick(2)} 
                    className={`btn btn-prize btn-prize-2nd ${showPrize && currentPrizeRank === 2 ? 'active' : ''}`}
                  >
                    2nd Prize
                  </button>
                  <button 
                    onClick={() => handlePrizeClick(3)} 
                    className={`btn btn-prize btn-prize-3rd ${showPrize && currentPrizeRank === 3 ? 'active' : ''}`}
                  >
                    3rd Prize
                  </button>
                  <button 
                    onClick={() => handlePrizeClick(4)} 
                    className={`btn btn-prize btn-prize-special ${showPrize && currentPrizeRank === 4 ? 'active' : ''}`}
                  >
                    Others
                  </button>
                </div>
              </div>
            )}

            {top3Hands.length > 0 && street !== 'river' && <Top3Hands hands={top3Hands} />}

            {street === 'river' && showTopHand && top3Hands.length > 0 && (
              <SingleHand 
                key={currentHandIndex}
                hand={top3Hands[currentHandIndex]} 
                rank={currentHandIndex + 1}
              />
            )}
          </>
        )}

        {showPrize && (
          <Prize 
            rank={currentPrizeRank}
            onClose={closePrize}
          />
        )}

        {!isInitialized && (
          <div className="start-screen">
            <div className="rules-section">
              <h2 className="rules-title">ルール説明</h2>
              <ul className="rules-list">
                <li>今から、画面上に5枚の共通カードが表示されます</li>
                <li>共通カード5枚と、披露宴入場時に選んだ手持ちカード2枚を用いて、ポーカーの役を作ってください。</li>
                <li className="rules-note">（ポーカーの役やルールがわからない方は、紫色のルールの紙をご参照ください！）</li>
                <li>この役が強い順に上位3名の方に、景品を差し上げます！</li>
              </ul>
            </div>
            <div className="start-message">
              「New Game」ボタンをクリックしてゲームを開始してください
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
