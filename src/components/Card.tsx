import { useEffect, useState, useRef } from 'react';
import type { Card as CardType } from '../types/poker';
import './Card.css';

interface CardProps {
  card: CardType | null;
  isRevealed?: boolean;
  shouldAnimate?: boolean;
  animationDelay?: number;
}

export function Card({ card, isRevealed = true, shouldAnimate = false, animationDelay = 0 }: CardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const prevRevealedRef = useRef(false);

  useEffect(() => {
    // カードが裏から表に変わる時にアニメーションをトリガー
    if (isRevealed && !prevRevealedRef.current && shouldAnimate) {
      // アニメーション開始前に即座に表面を非表示にするため、状態を設定
      // requestAnimationFrameを使って次のフレームでアニメーションを開始
      const frameId = requestAnimationFrame(() => {
        const timer = setTimeout(() => {
          // カードが捲られるタイミングでcard_flipを再生
          const flipSound = new Audio('/card_flip.mp3');
          flipSound.volume = 0.5;
          flipSound.play().catch(() => {});
          setIsAnimating(true);
          setAnimationCompleted(false);
          // アニメーション終了後に状態をリセット
          setTimeout(() => {
            setIsAnimating(false);
            setAnimationCompleted(true);
          }, 600);
        }, animationDelay);
        
        return () => clearTimeout(timer);
      });
      
      prevRevealedRef.current = true;
      return () => {
        cancelAnimationFrame(frameId);
      };
    } else if (isRevealed) {
      prevRevealedRef.current = true;
      // アニメーションが不要な場合（既に表示済み）は完了状態にする
      if (!shouldAnimate) {
        setAnimationCompleted(true);
      }
    } else {
      prevRevealedRef.current = false;
      setAnimationCompleted(false);
    }
  }, [isRevealed, shouldAnimate, animationDelay]);

  const isRed = card ? (card.suit === '♥' || card.suit === '♦') : false;
  const showFront = isRevealed && card !== null;
  // アニメーション中のみ裏面を表示、完了後は非表示
  const showBack = !isRevealed || (isAnimating && shouldAnimate && !animationCompleted);
  
  // アニメーション開始前で、まだ完了していない場合のみ表面を非表示にする
  const shouldHideFront = shouldAnimate && !isAnimating && !animationCompleted && isRevealed;

  return (
    <div className={`card-container ${isAnimating ? 'flipping' : ''}`} style={{ animationDelay: `${animationDelay}ms` }}>
      {/* カードの裏面 */}
      {showBack && (
        <div className="card card-back card-back-face">
          <div className="card-back-pattern"></div>
        </div>
      )}
      {/* カードの表面 - アニメーション中でも常にレンダリング（CSSで制御） */}
      {showFront && (
        <div className={`card card-front ${isRed ? 'card-red' : 'card-black'} ${isAnimating && shouldAnimate ? 'card-front-face' : ''} ${shouldHideFront ? 'card-front-hidden' : ''} ${animationCompleted ? 'card-front-completed' : ''}`}>
          <div className="card-rank">{card.rank}</div>
          <div className="card-suit">{card.suit}</div>
        </div>
      )}
    </div>
  );
}


