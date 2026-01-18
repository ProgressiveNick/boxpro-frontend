/**
 * Кастомный storage для zustand на основе cookies
 */
export const cookieStorage = {
  getItem: (name: string): string | null => {
    if (typeof document === "undefined") {
      return null;
    }

    try {
      const nameEQ = name + "=";
      const ca = document.cookie.split(";");
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
          try {
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
          } catch {
            return c.substring(nameEQ.length, c.length);
          }
        }
      }
    } catch (error) {
      console.error("Error reading cookie:", error);
    }
    return null;
  },
  setItem: (name: string, value: string): void => {
    if (typeof document === "undefined") {
      return;
    }

    try {
      // Устанавливаем cookie на 30 дней
      const expires = new Date();
      expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000);
      const cookieValue =
        encodeURIComponent(value) +
        "; expires=" +
        expires.toUTCString() +
        "; path=/; SameSite=Lax";
      document.cookie = name + "=" + cookieValue;
    } catch (error) {
      console.error("Error setting cookie:", error);
    }
  },
  removeItem: (name: string): void => {
    if (typeof document === "undefined") {
      return;
    }
    try {
      document.cookie =
        name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    } catch (error) {
      console.error("Error removing cookie:", error);
    }
  },
};
