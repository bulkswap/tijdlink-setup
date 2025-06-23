
// pages/eenmalig.js
import { useEffect } from "react";

export default function Eenmalig() {
  useEffect(() => {
    window.location.href = "https://tikkie.me/pay/v5e4jnd2iqbhe7o53k0n";
  }, []);

  return <p>Je wordt doorgestuurd naar Tikkie...</p>;
}
