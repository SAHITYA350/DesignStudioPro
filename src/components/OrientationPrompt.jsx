import { TbDeviceMobile } from "react-icons/tb";

export default function OrientationPrompt({ show }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-6">
      <div className="text-center text-white">
        <TbDeviceMobile className="mx-auto mb-4 animate-bounce" size={80} />
        <h2 className="text-2xl font-bold mb-2">Rotate Your Device</h2>
        <p className="text-lg">Please rotate your device to landscape mode for the best experience</p>
      </div>
    </div>
  );
}