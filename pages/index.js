export async function getServerSideProps() {
  return {
    redirect: {
      destination: 'https://www.tikkie.me/particulier',
      permanent: false,
    },
  };
}

export default function Home() {
  return null;
}
