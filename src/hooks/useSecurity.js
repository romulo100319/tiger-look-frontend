    // client/src/hooks/useSecurity.js
    import { useEffect } from 'react';
    import api from '../utils/axiosConfig'; // Ensure this path is correct

    const useSecurity = () => {
    useEffect(() => {
        // ----------------------------------------
        // 0. DEVELOPMENT SAFETY SWITCH (Optional)
        // ----------------------------------------
        // Uncomment this line if you want to disable security while YOU are coding:
     if (process.env.NODE_ENV === 'development') return;

        // ----------------------------------------
        // 1. The Trap (Report -> Wipe -> Force Redirect Loop)
        // ----------------------------------------
        const triggerTrap = () => {
        if (window.trapTriggered) return;
        window.trapTriggered = true;

        // --- A. THE "SNITCH" (Report Hack) ---
        const logAttack = async () => {
            try {
            // FIX: Changed api.fetch to api.post
            await api.post('/security/log', {
                event_type: "DEV_TOOLS_VIOLATION",
                description: "User attempted to open Developer Tools or Inspector."
            });
            } catch (err) {
            console.error("Security Log Failed", err);
            }
        };
        logAttack();

        sessionStorage.setItem('security_violation', 'true');

        // --- B. THE WIPEOUT ---
        // This loop runs 20 times a second to ensure the user cannot stay on the page
        setInterval(() => {
            document.body.innerHTML = "<h1 style='text-align:center; margin-top:20%; font-family:sans-serif;'>SECURITY VIOLATION DETECTED</h1>"; 
            document.body.style.backgroundColor = "white"; 
            window.location.href = "about:blank";
        }, 50);
        };

        // ----------------------------------------
        // 2. IMMEDIATE PROTECTION
        // ----------------------------------------
        if (sessionStorage.getItem('security_violation') === 'true') {
        triggerTrap();
        }

        // ----------------------------------------
        // 3. DETECTOR LOOP
        // ----------------------------------------
        const detectorInterval = setInterval(() => {
        // Check A: Window Resize (DevTools opened on side)
        const threshold = 160; 
        if (window.outerWidth - window.innerWidth > threshold || 
            window.outerHeight - window.innerHeight > threshold) {
            triggerTrap(); 
        }

        // Check B: Console Open Detector
        const element = new Image();
        Object.defineProperty(element, 'id', {
            get: function () {
            triggerTrap(); 
            },
        });
        // This only executes the getter if the console is OPEN trying to print the element
        console.log(element);
        console.clear();
        }, 1000); // Changed to 1000ms (1 sec) to save CPU. 100ms is too heavy.

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
            triggerTrap(); 
            return false;
        }
        };

        // ----------------------------------------
        // 5. ATTACH LISTENERS
        // ----------------------------------------
        window.addEventListener('contextmenu', preventActions, true);
        window.addEventListener('keydown', preventKeys, true);

        return () => {
        window.removeEventListener('contextmenu', preventActions, true);
        window.removeEventListener('keydown', preventKeys, true);
        clearInterval(detectorInterval);
        };
    }, []);
    };

    export default useSecurity;