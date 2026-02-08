import Spinner from './Spinner';

const FullScreenLoader = () => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <Spinner size={40} />
    </div>
  );
};

export default FullScreenLoader;
