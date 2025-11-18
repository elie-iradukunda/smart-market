import React from 'react';

export default function ArtworkFilesList() {
  const files = [
    { id: 1, name: 'acme-opening-banner-v3.pdf', source: 'Customer upload', status: 'Approved' },
    { id: 2, name: 'acme-opening-banner-proof.png', source: 'Studio proof', status: 'Sent to customer' },
  ];

  return (
    <div className="mt-4">
      <h3 className="text-md font-medium">Artwork Files</h3>
      <ul className="mt-2 space-y-2 text-sm">
        {files.map(file => (
          <li
            key={file.id}
            className="flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-2"
          >
            <div>
              <p className="font-medium text-gray-800">{file.name}</p>
              <p className="text-xs text-gray-500">{file.source}</p>
            </div>
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
              {file.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

