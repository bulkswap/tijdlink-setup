
export default function RedirectPage() {
  if (typeof window !== "undefined") {
    window.location.href = "https://beltegoed.nl/bol-com-cadeaukaart";
  }
  return null;
}
