import { useState, useEffect } from 'react';
import './WashingLoader.css';

const WashingLoader = () => {
  const [isSpinning, setIsSpinning] = useState(false);

  // Start the spinner when the component mounts (mimicking the loading process)
  useEffect(() => {
    setIsSpinning(true);
    const timer = setTimeout(() => setIsSpinning(false), 5000); // Stop spinning after 5 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="loader-container">
      <div className={`washing-machine ${isSpinning ? 'spin' : ''}`}>
        <div className="door">
          <div className="clothes">
            <div className="sock sock1"></div>
            <div className="sock sock2"></div>
            <div className="sock sock3"></div>
          </div>
        </div>
      </div>
      <p className="loading-text">Hanging data out to dry... Please wait.</p>
    </div>
  );
};

export default WashingLoader;
