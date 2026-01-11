export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export type HandRank =
  | 'High Card'
  | 'Pair'
  | 'Two Pair'
  | 'Three of a Kind'
  | 'Straight'
  | 'Flush'
  | 'Full House'
  | 'Four of a Kind'
  | 'Straight Flush'
  | 'Royal Flush';

export interface EvaluatedHand {
  cards: Card[];
  rank: HandRank;
  value: number; // 比較用の数値
  description: string;
}

export interface PlayerHandInfo {
  playerCards: Card[]; // プレイヤーの2枚
  bestHand: EvaluatedHand; // 最強の5枚のハンド
  communityCardsUsed: Card[]; // 役に使われたコミュニティカード
}

export type Street = 'preflop' | 'flop' | 'turn' | 'river';


