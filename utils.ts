// A small utility to play a notification sound.
// It uses the Web Audio API for a simple, dependency-free sound.

export const playNotificationSound = () => {
    try {
        // Create an AudioContext. This is the entry point to the Web Audio API.
        // The 'any' cast is for older browser compatibility (webkitAudioContext).
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Browsers may suspend the AudioContext until a user interaction.
        // We attempt to resume it if it's suspended.
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        // Create an OscillatorNode to generate a sound wave.
        const oscillator = audioCtx.createOscillator();
        // Create a GainNode to control the volume.
        const gainNode = audioCtx.createGain();

        // Configure the oscillator
        oscillator.type = 'sine'; // A smooth, clean tone
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note, high but not piercing

        // Configure the gain (volume)
        // Start at 50% volume
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        // Fade out smoothly over 0.2 seconds for a less abrupt sound.
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);

        // Connect the nodes: oscillator -> gain -> speakers
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        // Start the sound now
        oscillator.start();
        // Stop it after 0.2 seconds (when the fade out is complete)
        oscillator.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
        // Log any errors to the console without crashing the app.
        console.error("Could not play notification sound.", e);
    }
};

const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) {
        return '';
    }
    const stringValue = String(value);
    // If the value contains a comma, a double quote, or a newline, wrap it in double quotes.
    if (/[",\n\r]/.test(stringValue)) {
        // Escape existing double quotes by doubling them.
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
};

export const downloadCSV = (data: any[], filename: string = 'export.csv') => {
    if (!data || data.length === 0) {
        alert("Aucune donnée à télécharger pour la période sélectionnée.");
        return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','), // header row
        ...data.map(row => 
            headers.map(fieldName => escapeCSV(row[fieldName])).join(',')
        )
    ];

    const csvString = csvRows.join('\r\n');
    
    // Add BOM for UTF-8 to ensure Excel opens it correctly with special characters
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvString], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};