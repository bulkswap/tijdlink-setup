
// pages/expired.js
import { useEffect } from "react";

export default function Expired() {
  useEffect(() => {
    window.location.href = "https://beltegoed.nl/bol-com-cadeaukaart";
  }, []);

  return <p>Je wordt doorgestuurd...</p>;
}
