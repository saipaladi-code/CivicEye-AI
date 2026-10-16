export const getCurrentLocation = () => new Promise((resolve, reject) => {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    reject(new Error('Location is not available in this browser.'));
    return;
  }

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      if (!Number.isFinite(coords.latitude) || !Number.isFinite(coords.longitude)) {
        reject(new Error('Your device returned invalid location coordinates.'));
        return;
      }
      resolve({ lat: coords.latitude, lng: coords.longitude });
    },
    (error) => {
      const message = error.code === error.PERMISSION_DENIED
        ? 'Location permission was denied. Allow location access in your browser and try again.'
        : error.code === error.POSITION_UNAVAILABLE
          ? 'Your current location could not be determined. Check your device location settings and try again.'
          : error.code === error.TIMEOUT
            ? 'Finding your location took too long. Please try again.'
            : 'Your current location could not be determined. Please try again.';
      reject(new Error(message));
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
});
