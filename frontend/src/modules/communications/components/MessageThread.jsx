import React from 'react';

export default function MessageThread() {
  const messages = [
    { id: 1, from: 'customer', channel: 'Instagram', text: 'Hi, can you brand 50 polo shirts before Friday?', time: '09:05' },
    { id: 2, from: 'agent', channel: 'Instagram', text: 'Yes, please share your logo and sizes.', time: '09:07' },
    { id: 3, from: 'customer', channel: 'Instagram', text: 'Sending artwork now.', time: '09:09' },
  ];

  return (
    <div className="rounded border border-gray-200 bg-white p-4 text-sm">
      <h2 className="text-md font-medium">Message Thread</h2>
      <div className="mt-3 space-y-2">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={
              'max-w-sm rounded px-3 py-2 text-sm ' +
              (msg.from === 'agent'
                ? 'ml-auto bg-primary-600 text-white'
                : 'mr-auto bg-gray-100 text-gray-900')
            }
          >
            <p>{msg.text}</p>
            <p className="mt-1 text-[10px] opacity-70">
              {msg.channel} · {msg.time}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

