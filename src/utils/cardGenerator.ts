import type { Card, Suit, Rank } from '../types/poker';

// すべてのカードのデッキを生成
export function getAllCards(): Card[] {
  const suits: Suit[] = ['♠', '♥', '♦', '♣'];
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  
  const allCards: Card[] = [];
  suits.forEach(suit => {
    ranks.forEach(rank => {
      allCards.push({ suit, rank });
    });
  });
  return allCards;
}

// デッキからランダムにカードを生成
export function generateRandomCards(count: number, exclude: Card[] = []): Card[] {
  const suits: Suit[] = ['♠', '♥', '♦', '♣'];
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  
  const allCards: Card[] = [];
  suits.forEach(suit => {
    ranks.forEach(rank => {
      allCards.push({ suit, rank });
    });
  });

  // 除外するカードをフィルタ
  const availableCards = allCards.filter(card => 
    !exclude.some(ex => ex.suit === card.suit && ex.rank === card.rank)
  );

  // ランダムに選択
  const selected: Card[] = [];
  const used = new Set<string>();
  
  while (selected.length < count && availableCards.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    const card = availableCards[randomIndex];
    const key = `${card.suit}-${card.rank}`;
    
    if (!used.has(key)) {
      selected.push(card);
      used.add(key);
    }
  }

  return selected;
}

// 使用済みカードを除外した残りのカードを取得
export function getRemainingCards(usedCards: Card[]): Card[] {
  const allCards = getAllCards();
  return allCards.filter(card => 
    !usedCards.some(used => used.suit === card.suit && used.rank === card.rank)
  );
}

// 残りのカードから2枚を選ぶすべての組み合わせを生成
export function getAllPossibleHands(remainingCards: Card[]): Card[][] {
  const hands: Card[][] = [];
  
  for (let i = 0; i < remainingCards.length; i++) {
    for (let j = i + 1; j < remainingCards.length; j++) {
      hands.push([remainingCards[i], remainingCards[j]]);
    }
  }
  
  return hands;
}


