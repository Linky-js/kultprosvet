


export const sendMetrik = (action, name) => {
    if (typeof window !== 'undefined' && typeof window.ym !== undefined) {
      
        window.ym(98628705, 'reachGoal', action, {URL: name});
        
    }
}