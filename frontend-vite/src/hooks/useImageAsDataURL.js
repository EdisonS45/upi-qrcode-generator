import { useState, useEffect } from 'react';

// This hook fetches an image from a URL and converts it to a base64 Data URL
// This is necessary because <Image> in react-pdf cannot render cross-origin URLs
export const useImageAsDataURL = (url) => {
  const [dataURL, setDataURL] = useState(null);

  useEffect(() => {
    if (!url) {
      setDataURL(null);
      return;
    }

    let isCancelled = false;

    const fetchData = async () => {
      try {
        // We use a CORS proxy for development if the image is on another domain
        // For production, you'd serve images from the same domain or configure CORS
        // const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
        
        // Simple fetch, assuming CORS is handled or same-origin
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onloadend = () => {
          if (!isCancelled) {
            setDataURL(reader.result);
          }
        };
        
        reader.readAsDataURL(blob);

      } catch (error) {
        console.error("Failed to fetch image as data URL:", url, error);
        if (!isCancelled) {
          setDataURL(null);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [url]);

  return dataURL;
};