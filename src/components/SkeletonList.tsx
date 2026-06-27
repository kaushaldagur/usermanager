export default function SkeletonList() {
  return (
    <section className="loading-desk" aria-label="Loading users">
      <div className="record-loader" aria-hidden="true">
        <span className="record-card card-one" />
        <span className="record-card card-two" />
        <span className="record-card card-three" />
      </div>
      <div>
        <h2>Sorting user records</h2>
        <p>Preparing the latest directory cards...</p>
      </div>
      <div className="skeleton-stack">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="skeleton-row" key={index}>
            <span />
            <div>
              <i />
              <b />
            </div>
            <em />
          </div>
        ))}
      </div>
    </section>
  );
}
