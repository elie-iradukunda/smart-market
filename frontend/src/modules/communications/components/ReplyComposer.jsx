import React from 'react';

export default function ReplyComposer() {
  return (
    <div className="rounded border border-gray-200 bg-white p-4 text-sm">
      <h2 className="text-md font-medium">Reply</h2>
      <textarea
        rows={4}
        defaultValue="Hi, thanks for reaching out!"
        className="mt-2 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700"
        >
          Send
        </button>
        <button
          type="button"
          className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Insert Template
        </button>
        <button
          type="button"
          className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Add Internal Note
        </button>
      </div>
    </div>
  );
}

