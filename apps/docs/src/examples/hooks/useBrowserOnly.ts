import { useEffect, useState } from 'react';

const useBrowserOnly = (): boolean => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return false;
  }
  return true;
};

export default useBrowserOnly;
