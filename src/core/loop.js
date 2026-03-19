export function createLoop(updateCallback, renderCallback) {
    let lastTime = 0;
    
    function animate(time) {
        requestAnimationFrame(animate);
        
        const delta = (time - lastTime) / 1000;
        lastTime = time;
        
        if (delta > 0.1) return; // Prevent huge jumps
        
        updateCallback(delta);
        renderCallback();
    }
    
    requestAnimationFrame(animate);
}
