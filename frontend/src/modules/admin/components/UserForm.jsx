import React from 'react';

export default function UserForm() {
  return (
    <form className="grid max-w-md gap-3">
      <h2 className="text-lg font-medium">User</h2>
      <label className="text-sm">
        <span className="block text-gray-700">Name</span>
        <input
          defaultValue="Mary"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Email</span>
        <input
          defaultValue="mary@topdesign.ug"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Role</span>
        <select className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none">
          <option>Receptionist</option>
          <option>Boss/Admin</option>
          <option>Accountant</option>
          <option>Technician Officer</option>
          <option>Marketing Officer</option>
          <option>Controller</option>
        </select>
      </label>
      <button
        type="button"
        className="mt-2 inline-flex items-center justify-center rounded bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
      >
        Save User (demo)
      </button>
    </form>
  );
}

