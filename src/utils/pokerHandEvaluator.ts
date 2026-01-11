import type { Card, EvaluatedHand, PlayerHandInfo } from '../types/poker';

// ランクの数値変換（Aは14として扱う）
const rankToValue: Record<string, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

// カードをソート（ランクの降順）
function sortCards(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => rankToValue[b.rank] - rankToValue[a.rank]);
}

// ランクの出現回数をカウント
function getRankCounts(cards: Card[]): Map<number, number> {
  const counts = new Map<number, number>();
  cards.forEach(card => {
    const value = rankToValue[card.rank];
    counts.set(value, (counts.get(value) || 0) + 1);
  });
  return counts;
}

// ストレートかどうかチェック
function isStraight(cards: Card[]): boolean {
  const values = cards.map(c => rankToValue[c.rank]).sort((a, b) => a - b);
  
  // 通常のストレート
  for (let i = 1; i < values.length; i++) {
    if (values[i] !== values[i - 1] + 1) {
      // A-2-3-4-5のストレート（Aを1として扱う）
      if (i === 1 && values[0] === 14 && values[1] === 2) {
        return values.slice(1).every((v, idx) => idx === 0 || v === values[idx - 1] + 1);
      }
      return false;
    }
  }
  return true;
}

// フラッシュかどうかチェック
function isFlush(cards: Card[]): boolean {
  return cards.every(card => card.suit === cards[0].suit);
}

// ハンドを評価
export function evaluateHand(cards: Card[]): EvaluatedHand {
  if (cards.length < 5) {
    // 5枚未満の場合は不完全なハンドとして扱う
    const sorted = sortCards(cards);
    return {
      cards: sorted,
      rank: 'High Card',
      value: 0,
      description: `${sorted.map(c => c.rank + c.suit).join(' ')}`
    };
  }

  const sorted = sortCards(cards);
  const rankCounts = getRankCounts(sorted);
  const counts = Array.from(rankCounts.values()).sort((a, b) => b - a);
  const values = sorted.map(c => rankToValue[c.rank]);
  const isStraightHand = isStraight(sorted);
  const isFlushHand = isFlush(sorted);

  // ロイヤルフラッシュ
  if (isStraightHand && isFlushHand && values[0] === 14 && values[4] === 10) {
    return {
      cards: sorted,
      rank: 'Royal Flush',
      value: 9000000,
      description: 'Royal Flush'
    };
  }

  // ストレートフラッシュ
  if (isStraightHand && isFlushHand) {
    const straightValue = values[0] === 14 && values[1] === 5 ? 5 : values[0];
    return {
      cards: sorted,
      rank: 'Straight Flush',
      value: 8000000 + straightValue,
      description: `Straight Flush, ${sorted[0].rank} high`
    };
  }

  // フォーカード
  if (counts[0] === 4) {
    const fourOfKind = Array.from(rankCounts.entries()).find(([_, count]) => count === 4)?.[0] || 0;
    const kicker = Array.from(rankCounts.entries()).find(([_, count]) => count === 1)?.[0] || 0;
    return {
      cards: sorted,
      rank: 'Four of a Kind',
      value: 7000000 + fourOfKind * 14 + kicker, // 14を掛けることで、より細かい比較が可能
      description: `Four of a Kind, ${getRankName(fourOfKind)}s`
    };
  }

  // フルハウス
  if (counts[0] === 3 && counts[1] === 2) {
    const three = Array.from(rankCounts.entries()).find(([_, count]) => count === 3)?.[0] || 0;
    const pair = Array.from(rankCounts.entries()).find(([_, count]) => count === 2)?.[0] || 0;
    return {
      cards: sorted,
      rank: 'Full House',
      value: 6000000 + three * 14 + pair, // 14を掛けることで、より細かい比較が可能
      description: `Full House, ${getRankName(three)}s over ${getRankName(pair)}s`
    };
  }

  // フラッシュ
  if (isFlushHand) {
    // すべてのカードのランクを考慮（高いカードほど重要）
    // 例: A-K-Q-J-9 は A-K-Q-J-8 より強い
    // 各カードの位置に応じた重み付け: 1枚目(最高) * 14^4 + 2枚目 * 14^3 + ... + 5枚目 * 14^0
    const flushValue = values[0] * 537824 + values[1] * 38416 + values[2] * 2744 + values[3] * 196 + values[4] * 14;
    return {
      cards: sorted,
      rank: 'Flush',
      value: 5000000 + flushValue,
      description: `Flush, ${sorted[0].rank} high`
    };
  }

  // ストレート
  if (isStraightHand) {
    const straightValue = values[0] === 14 && values[1] === 5 ? 5 : values[0];
    return {
      cards: sorted,
      rank: 'Straight',
      value: 4000000 + straightValue,
      description: `Straight, ${getRankName(straightValue)} high`
    };
  }

  // スリーカード
  if (counts[0] === 3) {
    const three = Array.from(rankCounts.entries()).find(([_, count]) => count === 3)?.[0] || 0;
    const kickers = Array.from(rankCounts.entries())
      .filter(([_, count]) => count === 1)
      .map(([v]) => v)
      .sort((a, b) => b - a);
    // 3カードのランクを最優先、次にキッカー2枚を考慮
    // 例: AAA-K-Q は AAA-K-J より強い
    // キッカー1枚目 * 14 + キッカー2枚目 で、より高いキッカーが優先される
    // 3カードのランク * 196 (14^2) で、キッカー2枚の最大値(14*14+13=209)より大きくなる
    const kickerValue = (kickers[0] || 0) * 14 + (kickers[1] || 0);
    return {
      cards: sorted,
      rank: 'Three of a Kind',
      value: 3000000 + three * 196 + kickerValue,
      description: `Three of a Kind, ${getRankName(three)}s`
    };
  }

  // ツーペア
  if (counts[0] === 2 && counts[1] === 2) {
    const pairs = Array.from(rankCounts.entries())
      .filter(([_, count]) => count === 2)
      .map(([v]) => v)
      .sort((a, b) => b - a);
    const kicker = Array.from(rankCounts.entries()).find(([_, count]) => count === 1)?.[0] || 0;
    return {
      cards: sorted,
      rank: 'Two Pair',
      value: 2000000 + pairs[0] * 10000 + pairs[1] * 100 + kicker,
      description: `Two Pair, ${getRankName(pairs[0])}s and ${getRankName(pairs[1])}s`
    };
  }

  // ワンペア
  if (counts[0] === 2) {
    const pair = Array.from(rankCounts.entries()).find(([_, count]) => count === 2)?.[0] || 0;
    const kickers = Array.from(rankCounts.entries())
      .filter(([_, count]) => count === 1)
      .map(([v]) => v)
      .sort((a, b) => b - a);
    return {
      cards: sorted,
      rank: 'Pair',
      value: 1000000 + pair * 10000 + kickers[0] * 1000 + kickers[1] * 100 + (kickers[2] || 0),
      description: `Pair of ${getRankName(pair)}s`
    };
  }

  // ハイカード
  const highCardValue = values.reduce((sum, v, i) => sum + v * Math.pow(14, 4 - i), 0);
  return {
    cards: sorted,
    rank: 'High Card',
    value: highCardValue,
    description: `${sorted[0].rank} high`
  };
}

// 数値をランク名に変換
function getRankName(value: number): string {
  const entries = Object.entries(rankToValue);
  const entry = entries.find(([_, v]) => v === value);
  return entry ? entry[0] : '';
}

// 7枚のカードから最強の5枚のハンドを選ぶ
export function getBestHand(sevenCards: Card[]): EvaluatedHand {
  // nullやundefinedをフィルタ
  const validCards = sevenCards.filter(card => card && card.suit && card.rank);
  
  if (validCards.length < 5) {
    return evaluateHand(validCards);
  }

  let bestHand: EvaluatedHand | null = null;

  // 7枚から5枚を選ぶ組み合わせ（C(7,5) = 21通り）
  function combine(cards: Card[], start: number, selected: Card[]): void {
    if (selected.length === 5) {
      const hand = evaluateHand(selected);
      if (!bestHand || hand.value > bestHand.value) {
        bestHand = hand;
      }
      return;
    }

    for (let i = start; i < cards.length; i++) {
      combine(cards, i + 1, [...selected, cards[i]]);
    }
  }

  combine(validCards, 0, []);
  return bestHand || evaluateHand(validCards.slice(0, 5));
}

// プレイヤーの2枚とコミュニティカードから最強のハンドを計算
export function getPlayerHandInfo(playerCards: Card[], communityCards: Card[]): PlayerHandInfo {
  const sevenCards = [...playerCards, ...communityCards];
  const bestHand = getBestHand(sevenCards);
  
  // 役の5枚のうち、コミュニティカードから選ばれたものを特定
  const communityCardsUsed = bestHand.cards.filter(card => 
    communityCards.some(cc => cc.suit === card.suit && cc.rank === card.rank)
  );

  return {
    playerCards,
    bestHand,
    communityCardsUsed
  };
}

// 複数のハンドからTop3を取得
export function getTop3Hands(allHands: EvaluatedHand[]): EvaluatedHand[] {
  return [...allHands]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
}

// 複数のPlayerHandInfoからTop3を取得
export function getTop3PlayerHands(allPlayerHands: PlayerHandInfo[]): PlayerHandInfo[] {
  return [...allPlayerHands]
    .sort((a, b) => b.bestHand.value - a.bestHand.value)
    .slice(0, 3);
}

// コミュニティカードから理論上可能なすべてのハンドを計算し、Top3のグループを取得
export function getTop3TheoreticalHands(
  communityCards: Card[],
  getRemainingCards: (usedCards: Card[]) => Card[],
  getAllPossibleHands: (remainingCards: Card[]) => Card[][]
): PlayerHandInfo[] {
  // 使用済みカード（コミュニティカード）を取得
  const usedCards = [...communityCards];
  
  // 残りのカードを取得
  const remainingCards = getRemainingCards(usedCards);
  
  // すべての可能な2枚のハンドを生成
  const allPossibleHands = getAllPossibleHands(remainingCards);
  
  // 各ハンドについて最強の役を計算
  const allPlayerHands: PlayerHandInfo[] = allPossibleHands.map(hand => 
    getPlayerHandInfo(hand, communityCards)
  );
  
  // valueでソート
  const sortedHands = [...allPlayerHands].sort((a, b) => b.bestHand.value - a.bestHand.value);
  
  // Top3のグループを取得（同じvalueのハンドも含める）
  if (sortedHands.length === 0) {
    return [];
  }
  
  const top3Values = new Set<number>();
  const result: PlayerHandInfo[] = [];
  
  for (const hand of sortedHands) {
    const value = hand.bestHand.value;
    if (top3Values.size < 3) {
      top3Values.add(value);
      result.push(hand);
    } else if (top3Values.has(value)) {
      // 同じvalueのハンドは追加（同じ強さのグループ）
      result.push(hand);
    } else {
      // Top3のvalue以外は追加しない
      break;
    }
  }
  
  return result;
}


