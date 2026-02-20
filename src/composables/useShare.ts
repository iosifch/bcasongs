export interface ShareResult {
  shared: boolean
  copied: boolean
  error?: unknown
}

export function useShare() {
  const share = async (title: string, url: string): Promise<ShareResult> => {
    const shareData = {
      title: title,
      text: `Check out "${title}" on BCA Songs`,
      url: url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return { shared: true, copied: false };
      } else {
        await navigator.clipboard.writeText(url);
        return { shared: false, copied: true };
      }
    } catch (err) {
      console.error('Error sharing:', err);
      return { shared: false, copied: false, error: err };
    }
  };

  return {
    share
  };
}
