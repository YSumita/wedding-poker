import type { Card, PlayerHandInfo } from '../types/poker';

// ハンドの表示形式を生成（例：QxQx、A♠Kx）
export function formatHandDisplay(playerCards: Card[]): string {
  if (playerCards.length !== 2) {
    return '';
  }

  const [card1, card2] = playerCards;
  
  // 同じランクの場合（例：Q♠Q♥ → QxQx）
  if (card1.rank === card2.rank) {
    return `${card1.rank}x${card2.rank}x`;
  }
  
  // 異なるランクの場合
  // スートが同じ場合は両方のスートを表示、異なる場合は強いカードのスートを表示
  // 例：A♦Q♦ → A♦Q♦、A♠K♥ → A♠Kx
  const rankToValue: Record<string, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };
  const value1 = rankToValue[card1.rank] || 0;
  const value2 = rankToValue[card2.rank] || 0;
  
  // スートが同じ場合は両方のスートを表示
  if (card1.suit === card2.suit) {
    if (value1 >= value2) {
      return `${card1.rank}${card1.suit}${card2.rank}${card2.suit}`;
    } else {
      return `${card2.rank}${card2.suit}${card1.rank}${card1.suit}`;
    }
  }
  
  // スートが異なる場合は強いカードのスートを表示
  if (value1 >= value2) {
    return `${card1.rank}${card1.suit}${card2.rank}x`;
  } else {
    return `${card2.rank}${card2.suit}${card1.rank}x`;
  }
}

// 同じ強さのハンドをグループ化
export interface GroupedHand {
  value: number;
  rank: string;
  description: string;
  hands: PlayerHandInfo[];
  displayText: string; // 例："QxQx" または "A♠Kx"
}

export function groupHandsByValue(hands: PlayerHandInfo[]): GroupedHand[] {
  // valueでグループ化
  const grouped = new Map<number, PlayerHandInfo[]>();
  
  hands.forEach(hand => {
    const value = hand.bestHand.value;
    if (!grouped.has(value)) {
      grouped.set(value, []);
    }
    grouped.get(value)!.push(hand);
  });
  
  // 各グループの表示テキストを生成
  const groupedHands: GroupedHand[] = Array.from(grouped.entries())
    .map(([value, handsInGroup]) => {
      // 同じvalueのハンドから、代表的な表示テキストを生成
      // すべてのハンドの表示形式を取得
      const displayTexts = handsInGroup.map(h => formatHandDisplay(h.playerCards));
      // ユニークな表示形式を取得（例：QxQxが複数ある場合、1つだけ表示）
      const uniqueDisplays = Array.from(new Set(displayTexts));
      
      // 表示テキストを生成（複数ある場合は最初のものを使用）
      const displayText = uniqueDisplays.length > 0 ? uniqueDisplays[0] : '';
      
      return {
        value,
        rank: handsInGroup[0].bestHand.rank,
        description: handsInGroup[0].bestHand.description,
        hands: handsInGroup,
        displayText
      };
    })
    .sort((a, b) => b.value - a.value); // valueの降順でソート
  
  return groupedHands;
}

