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
      // フロップ: K♦, J♦, A♣
      // ターン: 10♣
      // リバー: 10♦
      const fixedCommunityCards: CardType[] = [
        { suit: '♦', rank: 'K' },  // Kd
        { suit: '♦', rank: 'J' },  // Jd
        { suit: '♣', rank: 'A' },  // Ac
        { suit: '♣', rank: '10' }, // Tc
        { suit: '♦', rank: '10' }, // Td
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
  // 1. A♦Q♦ - ロイヤルフラッシュ（ダイヤ）
  // 2. Q♦9♦ - ストレートフラッシュ  
  // 3. 10のペア - フォーカード
  // 4. AA - フルハウス
  const top3Hands = useMemo(() => {
    if (street !== 'river') {
      return [];
    }

    try {
      const revealedCards = communityCards.filter(card => card !== null) as CardType[];
      
      if (revealedCards.length === 0) {
        return [];
      }

      // 指定されたハンドを直接作成
      // 1. A♦Q♦ - ロイヤルフラッシュ（A♦, K♦, Q♦, J♦, 10♦）
      const hand1Player: CardType[] = [
        { suit: '♦', rank: 'A' },
        { suit: '♦', rank: 'Q' }
      ];
      const hand1Best: CardType[] = [
        { suit: '♦', rank: 'A' },
        { suit: '♦', rank: 'K' },
        { suit: '♦', rank: 'Q' },
        { suit: '♦', rank: 'J' },
        { suit: '♦', rank: '10' }
      ];
      const royalFlush: PlayerHandInfo = {
        playerCards: hand1Player,
        bestHand: {
          cards: hand1Best,
          rank: 'Royal Flush',
          value: 9000000,
          description: 'Royal Flush'
        },
        communityCardsUsed: [
          { suit: '♦', rank: 'K' },
          { suit: '♦', rank: 'J' },
          { suit: '♦', rank: '10' }
        ]
      };
      
      // 2. Q♦9♦ - ストレートフラッシュ（Q♦, J♦, 10♦, 9♦, 8♦）
      const hand2Player: CardType[] = [
        { suit: '♦', rank: 'Q' },
        { suit: '♦', rank: '9' }
      ];
      const hand2Best: CardType[] = [
        { suit: '♦', rank: 'Q' },
        { suit: '♦', rank: 'J' },
        { suit: '♦', rank: '10' },
        { suit: '♦', rank: '9' },
        { suit: '♦', rank: '8' }
      ];
      const straightFlush: PlayerHandInfo = {
        playerCards: hand2Player,
        bestHand: {
          cards: hand2Best,
          rank: 'Straight Flush',
          value: 8000000 + 12, // Q = 12
          description: 'Straight Flush, Q high'
        },
        communityCardsUsed: [
          { suit: '♦', rank: 'J' },
          { suit: '♦', rank: '10' }
        ]
      };
      
      // 3. 10のペア - フォーカード（10♠, 10♥, 10♣, 10♦ + キッカー）
      const hand3Player: CardType[] = [
        { suit: '♠', rank: '10' },
        { suit: '♥', rank: '10' }
      ];
      const hand3Best: CardType[] = [
        { suit: '♠', rank: '10' },
        { suit: '♥', rank: '10' },
        { suit: '♣', rank: '10' },
        { suit: '♦', rank: '10' },
        { suit: '♣', rank: 'A' } // キッカー（コミュニティカードのA♣）
      ];
      const fourOfAKind: PlayerHandInfo = {
        playerCards: hand3Player,
        bestHand: {
          cards: hand3Best,
          rank: 'Four of a Kind',
          value: 7000000 + 10 * 14 + 14, // 10のフォーカード + Aキッカー
          description: 'Four of a Kind, 10s'
        },
        communityCardsUsed: [
          { suit: '♣', rank: '10' },
          { suit: '♦', rank: '10' },
          { suit: '♣', rank: 'A' }
        ]
      };

      // 4. AA - フルハウス（A-High）（A♠, A♥, A♣, 10♣, 10♦）
      // A♣以外のAの2枚の組み合わせ: (A♠, A♥), (A♠, A♦), (A♥, A♦)
      const hand4Player1: CardType[] = [
        { suit: '♠', rank: 'A' },
        { suit: '♥', rank: 'A' }
      ];
      const hand4Player2: CardType[] = [
        { suit: '♠', rank: 'A' },
        { suit: '♦', rank: 'A' }
      ];
      const hand4Player3: CardType[] = [
        { suit: '♥', rank: 'A' },
        { suit: '♦', rank: 'A' }
      ];
      const hand4Best: CardType[] = [
        { suit: '♠', rank: 'A' },
        { suit: '♥', rank: 'A' },
        { suit: '♣', rank: 'A' },
        { suit: '♣', rank: '10' },
        { suit: '♦', rank: '10' }
      ];
      const fullHouseA: PlayerHandInfo = {
        playerCards: hand4Player1, // デフォルトとして最初の組み合わせを使用
        bestHand: {
          cards: hand4Best,
          rank: 'Full House',
          value: 6000000 + 14 * 14 + 10, // Aのスリーカード + 10のペア
          description: 'Full House, As over 10s'
        },
        communityCardsUsed: [
          { suit: '♣', rank: 'A' },
          { suit: '♣', rank: '10' },
          { suit: '♦', rank: '10' }
        ]
      };
      // 複数のプレイヤーハンドを保存（カスタムプロパティとして）
      (fullHouseA as any).alternativePlayerCards = [hand4Player2, hand4Player3];

      // 5. KK - フルハウス（K-High）（K♠, K♥, K♦, 10♣, 10♦）
      // K♦以外のKの2枚の組み合わせ: (K♠, K♥), (K♠, K♣), (K♥, K♣)
      const hand5Player1: CardType[] = [
        { suit: '♠', rank: 'K' },
        { suit: '♥', rank: 'K' }
      ];
      const hand5Player2: CardType[] = [
        { suit: '♠', rank: 'K' },
        { suit: '♣', rank: 'K' }
      ];
      const hand5Player3: CardType[] = [
        { suit: '♥', rank: 'K' },
        { suit: '♣', rank: 'K' }
      ];
      const hand5Best: CardType[] = [
        { suit: '♠', rank: 'K' },
        { suit: '♥', rank: 'K' },
        { suit: '♦', rank: 'K' },
        { suit: '♣', rank: '10' },
        { suit: '♦', rank: '10' }
      ];
      const fullHouseK: PlayerHandInfo = {
        playerCards: hand5Player1, // デフォルトとして最初の組み合わせを使用
        bestHand: {
          cards: hand5Best,
          rank: 'Full House',
          value: 6000000 + 13 * 14 + 10, // Kのスリーカード + 10のペア
          description: 'Full House, Ks over 10s'
        },
        communityCardsUsed: [
          { suit: '♦', rank: 'K' },
          { suit: '♣', rank: '10' },
          { suit: '♦', rank: '10' }
        ]
      };
      // 複数のプレイヤーハンドを保存（カスタムプロパティとして）
      (fullHouseK as any).alternativePlayerCards = [hand5Player2, hand5Player3];

      // 6. JJ - フルハウス（J-High）（J♠, J♥, J♦, 10♣, 10♦）
      // J♦以外のJの2枚の組み合わせ: (J♠, J♥), (J♠, J♣), (J♥, J♣)
      const hand6Player1: CardType[] = [
        { suit: '♠', rank: 'J' },
        { suit: '♥', rank: 'J' }
      ];
      const hand6Player2: CardType[] = [
        { suit: '♠', rank: 'J' },
        { suit: '♣', rank: 'J' }
      ];
      const hand6Player3: CardType[] = [
        { suit: '♥', rank: 'J' },
        { suit: '♣', rank: 'J' }
      ];
      const hand6Best: CardType[] = [
        { suit: '♠', rank: 'J' },
        { suit: '♥', rank: 'J' },
        { suit: '♦', rank: 'J' },
        { suit: '♣', rank: '10' },
        { suit: '♦', rank: '10' }
      ];
      const fullHouseJ: PlayerHandInfo = {
        playerCards: hand6Player1, // デフォルトとして最初の組み合わせを使用
        bestHand: {
          cards: hand6Best,
          rank: 'Full House',
          value: 6000000 + 11 * 14 + 10, // Jのスリーカード + 10のペア
          description: 'Full House, Js over 10s'
        },
        communityCardsUsed: [
          { suit: '♦', rank: 'J' },
          { suit: '♣', rank: '10' },
          { suit: '♦', rank: '10' }
        ]
      };
      // 複数のプレイヤーハンドを保存（カスタムプロパティとして）
      (fullHouseJ as any).alternativePlayerCards = [hand6Player2, hand6Player3];

      return [royalFlush, straightFlush, fourOfAKind, fullHouseA, fullHouseK, fullHouseJ];
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
                <li>今から、画面上にポーカーのテキサスホールデムと同じ要領で5枚のボードカードが表示されます</li>
                <li>披露宴入場時に選んだ袋に入っている2枚のトランプと、ボードカード5枚を用いて、ポーカーの役を作ってください。</li>
                <li className="rules-note">（ポーカーの役やルールは、お手元のプロフィールブックをご確認ください！）</li>
                <li>この役が強い順に上位3名の方に商品を差し上げます！</li>
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
