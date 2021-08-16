import { useState } from 'react';
import globalStyles from 'theme/globalStyles.module.css';
import { NavLink } from 'react-router-dom';
import { useWeb3, connectToNetwork } from 'web3/context';
import { smartTrim } from 'helpers/functions';
import { networkIdToName } from 'helpers/vars';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { Hamburger, SideTray } from 'components';
import { playSound } from 'helpers/hooks/useSound';
import styles from './styles.module.css';

const WalletButton = () => {
  const { state: { address, networkId, loading }, dispatch } = useWeb3();

  const handleWalletClick = () => {
    if (!address) {
      playSound('click');
      connectToNetwork(dispatch, window.ethereum);
    }
  };

  return (
    <button className={styles.walletContainer} onClick={handleWalletClick} disabled={!!address}>
      {loading ? "Loading..." : address  ? (
          <div className={styles.walletAddress}>
            <Jazzicon diameter={24} seed={jsNumberForAddress(address)} />
            <div className={styles.connectedDetails}>
              <p>{networkId ? networkIdToName[networkId] : ''}</p>
              <p>
                {smartTrim(address, 8)}
              </p>
            </div>
          </div>
        )
        : 'Connect'}
    </button>
  );
};

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <nav className={`${globalStyles.container} ${styles.desktopHeaderContent}`}>
        <ul className={styles.navContainer}>
          <NavLink
            onClick={() => playSound('click')}
            to="/"
            className={styles.navLink}
            activeClassName={styles.activeNavLink}
            isActive={(_, location) => {
              if (!location) return false;
              const { pathname } = location;
              return pathname === '/';
            }}
          >
            Game
          </NavLink>
          <NavLink
            onClick={() => playSound('click')}
            to="/leaderboard"
            className={styles.navLink}
            activeClassName={styles.activeNavLink}
          >
            Leaderboard
          </NavLink>
          <NavLink
            onClick={() => playSound('click')}
            to="/settings"
            className={styles.navLink}
            activeClassName={styles.activeNavLink}
          >
            Settings
          </NavLink>
        </ul>
        <WalletButton />
      </nav>
      <div className={styles.mobileHeaderContent}>
        <Hamburger onClick={() => setMenuOpen((prevState) => !prevState)} />
        <SideTray open={menuOpen}>
          <nav>
            <NavLink
              onClick={() => playSound('click')}
              to="/"
              className={styles.navLink}
              activeClassName={styles.activeNavLink}
              isActive={(_, location) => {
                if (!location) return false;
                const { pathname } = location;
                return pathname === '/';
              }}
            >
              Game
            </NavLink>
            <NavLink
              onClick={() => playSound('click')}
              to="/leaderboard"
              className={styles.navLink}
              activeClassName={styles.activeNavLink}
            >
              Leaderboard
            </NavLink>
            <NavLink
              onClick={() => playSound('click')}
              to="/settings"
              className={styles.navLink}
              activeClassName={styles.activeNavLink}
            >
              Settings
            </NavLink>
            <WalletButton />
          </nav>
        </SideTray>
      </div>
    </header>
  );
};
