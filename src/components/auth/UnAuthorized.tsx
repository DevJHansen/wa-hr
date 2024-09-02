import { Link } from 'react-router-dom';

export const UnAuthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-primary">
      <h1 className="text-6xl font-bold">403</h1>
      <p className="text-2xl mt-4">Unauthorized Access</p>
      <Link to="/">
        <div className="mt-6 px-6 py-3 bg-accent text-white rounded-lg hover:bg-secondary transition">
          Go Home
        </div>
      </Link>
    </div>
  );
};
