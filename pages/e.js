
export default function Expired() {
  if (typeof window !== "undefined") {
    window.location.href = "https://tikkie.me/verlopen/";
  }
  return null;
}
