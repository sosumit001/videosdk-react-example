import Button from '../../@ui/button';

export const Whiteboard = ({
  isWhiteboardOpen,
  whiteboardUrl,
  handleWhiteBoard,
}) => {
  return (
    <div
      className={`${isWhiteboardOpen ? 'fixed' : 'hidden'} flex items-end flex-col bg-gray-200 w-[95vw] h-[100vh] z-50 left-[2.5vw] top-0`}
    >
      <Button
        text="x Close"
        background="bg-red-600"
        onClick={() => handleWhiteBoard()}
        className="m-4 w-[120px] absolute right-4 top-2 z-[100]"
      />
      <iframe src={whiteboardUrl} className="w-full z-50 h-full"></iframe>
    </div>
  );
};
