export async function getServerSideProps() {
  return {
    redirect: {
      destination: 'https://www.abnamro.nl/nl/prive/internet-en-mobiel/apps/tikkie/index.html',
      permanent: false,
    },
  };
}

export default function Home() {
  return null;
}
