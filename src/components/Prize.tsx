import './Prize.css';

interface PrizeProps {
  rank: number;
  onClose: () => void;
}

const prizes = [
  {
    rank: 1,
    name: '1位賞品：JTB旅行券3万円分',
    image: '/prizes/1st-prize.jpg'
  },
  {
    rank: 2,
    name: '2位賞品：高級松坂牛',
    image: '/prizes/2nd-prize.jpg'
  },
  {
    rank: 3,
    name: '3位賞品：新郎新婦を1日自由に使える券',
    image: '/prizes/3rd-prize.jpg'
  }
];

export function Prize({ rank, onClose }: PrizeProps) {
  const prize = prizes.find(p => p.rank === rank);
  
  if (!prize) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content prize-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="prize-content">
          <div className="prize-rank-badge">{rank}位</div>
          <h2 className="prize-name">{prize.name}</h2>
          <div className="prize-image-container">
            <img src={prize.image} alt={prize.name} className="prize-image" />
          </div>
        </div>
      </div>
    </div>
  );
}
