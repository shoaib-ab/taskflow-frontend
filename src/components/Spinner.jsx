import '../index.css';

const Spinner = ({ size = 32, color = '#2563eb' }) => {
  return (
    <span
      style={{
        width: size,
        height: size,
        border: `3px solid rgba(255, 255, 255, 0.3)`,
        borderTop: `3px solid ${color}`,
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  );
};

export default Spinner;
