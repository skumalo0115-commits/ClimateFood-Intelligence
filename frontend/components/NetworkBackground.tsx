export default function NetworkBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="network-lines" />
      <div className="network-nodes" />
      <div className="network-nodes delay" />
    </div>
  );
}
