import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="state-panel">
      <h1>Page not found</h1>
      <p>The page you opened is not part of this directory.</p>
      <Link className="secondary-action" to="/">
        Back to users
      </Link>
    </section>
  );
}
