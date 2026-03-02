import { useEffect, useRef } from 'react';
import './Prize.css';

interface PrizeProps {
  rank: number;
  onClose: () => void;
}

const prizes = [
  {
    rank: 1,
    name: 'JTBカタログギフト - たびもの撰華 梓',
    description: '"暮らしを彩る旅への出発"を—— 日本全国から選べる日帰り温泉や憧れのホテル、美食に伝統工芸品などきっと満足いただける、贅沢な品を選りすぐのカタログギフトです。',
    image: '/prizes/1st-prize.jpg'
  },
  {
    rank: 2,
    name: '2位：松坂牛ギフトカタログ',
    description: '日本三大和牛の代表格。肉質が柔らかく、霜降りがきめ細かく脂肪に甘みがあり、霜降り肉・赤身肉・希少部位まで選べるギフトです。',
    image: '/prizes/2nd-prize.jpg'
  },
  {
    rank: 3,
    name: 'オフィシーヌ・ユニヴェルセル・ビュリー「高級ボディソープ」',
    description: '1803年パリ発のラグジュアリーブランド。自然由来の原料で丁寧に作られた高級ボディソープで、洗い上がりのなめらかさと上質な香りをお楽しみいただけます。',
    image: '/prizes/3rd-prize.png'
  },
  {
    rank: 4,
    name: '新郎新婦を1日自由に使える券',
    image: '/prizes/special-prize.jpg'
  }
];

export function Prize({ rank, onClose }: PrizeProps) {
  const drumrollRef = useRef<HTMLAudioElement | null>(null);
  const celebrationRef = useRef<HTMLAudioElement | null>(null);
  const hasPlayedCelebrationRef = useRef<boolean>(false);
  
  const prize = prizes.find(p => p.rank === rank);
  
  useEffect(() => {
    // フラグをリセット
    hasPlayedCelebrationRef.current = false;
    
    // まず、既存の音声をクリーンアップ
    if (drumrollRef.current) {
      drumrollRef.current.pause();
      drumrollRef.current = null;
    }
    if (celebrationRef.current) {
      celebrationRef.current.pause();
      celebrationRef.current = null;
    }

    // drumrollを再生
    drumrollRef.current = new Audio('/drumroll(end).mov');
    celebrationRef.current = new Audio('/celebration.mp3');
    
    // celebrationを確実に停止状態にしておく
    celebrationRef.current.pause();
    celebrationRef.current.currentTime = 0;
    
    // celebrationの再生を確実にdrumrollのendedイベントでのみ実行するハンドラー
    const handleDrumrollEnd = () => {
      // 既に再生済みの場合は再生しない
      if (hasPlayedCelebrationRef.current) {
        return;
      }
      
      // drumrollのendedイベントが発火した時のみcelebrationを再生（1回だけ）
      if (celebrationRef.current && !hasPlayedCelebrationRef.current) {
        hasPlayedCelebrationRef.current = true;
        celebrationRef.current.pause();
        celebrationRef.current.currentTime = 0;
        celebrationRef.current.play().catch(console.error);
      }
    };
    
    const playSounds = async () => {
      if (drumrollRef.current) {
        // drumrollのendedイベントリスナーを登録（イベントリスナーは再生前に登録）
        drumrollRef.current.addEventListener('ended', handleDrumrollEnd, { once: true });
        
        try {
          // drumrollを最初から再生
          drumrollRef.current.currentTime = 0;
          await drumrollRef.current.play();
          // celebrationはdrumrollのendedイベントでのみ再生される
        } catch (error) {
          console.error('drumroll再生エラー:', error);
          // drumrollが再生できない場合は、celebrationは再生しない
        }
      }
    };

    playSounds();

    // クリーンアップ
    return () => {
      if (drumrollRef.current) {
        drumrollRef.current.removeEventListener('ended', handleDrumrollEnd);
        drumrollRef.current.pause();
        drumrollRef.current.currentTime = 0;
        drumrollRef.current = null;
      }
      if (celebrationRef.current) {
        celebrationRef.current.pause();
        celebrationRef.current.currentTime = 0;
        celebrationRef.current = null;
      }
    };
  }, [rank]); // rankが変わった時にも再生

  if (!prize) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content prize-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="prize-content">
          <div className="prize-rank-badge">
            {rank === 4 ? '特別賞' : `${rank}位`}
          </div>
          <h2 className="prize-name">{prize.name}</h2>
          {prize.description && (
            <p className="prize-description">{prize.description}</p>
          )}
          <div className="prize-image-container">
            <img src={prize.image} alt={prize.name} className="prize-image" />
          </div>
        </div>
      </div>
    </div>
  );
}
