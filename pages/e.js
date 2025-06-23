
import { useEffect } from "react";

export default function E() {
  useEffect(() => {
    window.location.href = "https://beltegoed.nl/bol-com-cadeaukaart";
  }, []);

  return <p>Deze link is verlopen. Je wordt doorgestuurd...</p>;
}
