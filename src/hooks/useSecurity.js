import { useEffect } from 'react';
import axios from 'axios'; 

const useSecurity = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    // ----------------------------------------
    // 0. DEVELOPMENT SAFETY SWITCH
    // ----------------------------------------
    // ⚠️ I-uncomment mo ito kung AYAW mong gumana ang security habang nagco-code ka.
    // Pero for testing ngayon, hayaan mo muna itong naka-comment.
    
    // if (process.env.NODE_ENV === 'development') return;

    // ----------------------------------------
    // 1. The Trap (Report -> Wipe -> Force Redirect Loop)
    // ----------------------------------------
    const triggerTrap = () => {
      if (window.trapTriggered) return;
      window.trapTriggered = true;

      // --- A. THE "SNITCH" (Report Hack to Backend) ---
      const logAttack = async () => {
        try {
          // Gumamit tayo ng sendBeacon para siguradong makarating bago mamatay ang page
          const blob = new Blob([JSON.stringify({
            event_type: "DEV_TOOLS_VIOLATION",
            description: "User attempted to open Developer Tools."
          })], { type: 'application/json; charset=UTF-8' });
          
          navigator.sendBeacon(`${API_URL}/security/log`, blob);
        } catch (err) {
          console.error("Security Log Failed", err);
        }
      };
      logAttack();

      sessionStorage.setItem('security_violation', 'true');

      // --- B. THE WIPEOUT (DRAMATIC EFFECT) ---
      // Burahin ang laman ng page at takutin ang user
      document.body.innerHTML = `
        <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; background:black; color:red; font-family:monospace; text-align:center;">
            <h1 style="font-size:3rem;">⚠️ SECURITY ALERT ⚠️</h1>
            <h2 style="color:white;">UNAUTHORIZED ACCESS DETECTED</h2>
            <p style="color:gray;">Your IP and Action have been logged.</p>
            <p>System Lockdown Initiated.</p>
        </div>
      `;
      
      // I-freeze ang scroll
      document.body.style.overflow = 'hidden';

      // (Optional) Redirect after 3 seconds kung gusto mo silang paalisin
      setTimeout(() => {
          window.location.href = "about:blank";
      }, 3000);
    };

    // ----------------------------------------
    // 2. IMMEDIATE PROTECTION CHECK
    // ----------------------------------------
    if (sessionStorage.getItem('security_violation') === 'true') {
      triggerTrap();
    }

    // ----------------------------------------
    // 3. DETECTOR LOOP (Check Resize)
    // ----------------------------------------
    const detectorInterval = setInterval(() => {
      // Check: Window Resize (Kapag binuksan ang DevTools sa gilid/ilalim)
      const threshold = 160; 
      if (
        window.outerWidth - window.innerWidth > threshold || 
        window.outerHeight - window.innerHeight > threshold
      ) {
        triggerTrap(); 
      }
    }, 1000);

    // ----------------------------------------
    // 4. BLOCKERS (Keyboard & Mouse)
    // ----------------------------------------
    const preventActions = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const preventKeys = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && e.key.toLowerCase() === 'u')
      ) {
        e.preventDefault();
        triggerTrap(); // HULI KA BALBON!
        return false;
      }
    };

    // ----------------------------------------
    // 5. ATTACH LISTENERS
    // ----------------------------------------
    window.addEventListener('contextmenu', preventActions); // Disable Right Click
    window.addEventListener('keydown', preventKeys);        // Disable Shortcuts

    return () => {
      window.removeEventListener('contextmenu', preventActions);
      window.removeEventListener('keydown', preventKeys);
      clearInterval(detectorInterval);
    };
  }, []);
};

export default useSecurity;