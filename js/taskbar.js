
import Wnd from './wnd.js';

export const Taskbar = {

    config: {
        version: "0.1.0",
        name: "sheogorad",
        debug: true
    },

    async noo() {

    }
};

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => Taskbar.init());

// Export for global access
window.Taskbar = Taskbar;

// Default export
export default Taskbar;