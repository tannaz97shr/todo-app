type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function Confirm({ open, onClose, onConfirm }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl p-5 w-[420px] max-w-[90vw] shadow-xl">
        <h4 className="text-lg font-semibold mb-2">Delete this task?</h4>
        <p className="text-sm text-gray-600 mb-4">
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-3 py-2 rounded-xl border"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded-xl bg-red-600 text-white"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
