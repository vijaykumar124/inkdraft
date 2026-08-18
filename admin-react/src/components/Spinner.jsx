export default function Spinner({ size = '40px', text = 'Loading...' }) {
  return (
    <div className="r-spinner-wrap">
      <div className="r-spinner" style={{ width: size, height: size }} />
      {text && <div className="r-spinner-text">{text}</div>}
    </div>
  );
}
