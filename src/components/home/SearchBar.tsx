export default function SearchBar() {
  return (
    <div className="flex justify-center -mt-10">
      <div className="bg-white shadow-xl rounded-2xl p-6 flex gap-4 w-full max-w-3xl">
        
        <select className="border p-2 rounded w-full text-sm">
          <option>Select Course</option>
        </select>

        <select className="border p-2 rounded w-full text-sm">
          <option>Select Field</option>
        </select>

        <select className="border p-2 rounded w-full text-sm">
          <option>Select Level</option>
        </select>

        <button className="bg-blue-600 text-white px-6 rounded-lg text-sm">
          Search Degrees
        </button>
      </div>
    </div>
  );
}   