import edu from "./data/history-edu.json";
import inte from "./data/history-int.json";
import proj from "./data/history-proj.json";

export default function App() {
  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-6">My Portfolio</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-4">🎓 Education</h2>
        {edu.map((item) => (
          <div key={item.keyid} className="mb-4 p-4 rounded-xl bg-white shadow">
            <h3 className="text-xl font-bold">{item.title}</h3>
            <p>{item.institution.name}</p>
            <p className="text-sm text-gray-500">{item.date.join(" ~ ")}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">🧪 Internships</h2>
        {inte.map((item) => (
          <div key={item.keyid} className="mb-4 p-4 rounded-xl bg-white shadow">
            <h3 className="text-xl font-bold">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.date.join(" ~ ")}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">🛠 Projects</h2>
        {proj.map((item) => (
          <div key={item.keyid} className="mb-4 p-4 rounded-xl bg-white shadow">
            <h3 className="text-xl font-bold">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.date.join(" ~ ")}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
