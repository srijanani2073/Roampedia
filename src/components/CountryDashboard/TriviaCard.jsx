import React from "react";

/**
 * Props:
 * - wikidata: result binding from SPARQL (may be null)
 * - wikipedia: wiki summary
 * - country: normalized country object
 */
export default function TriviaCard({ wikidata, wikipedia, country }) {
  const facts = [];

  if (country?.capital) facts.push({ emoji: "🏛️", text: `Capital: ${country.capital}` });
  if (country?.population) facts.push({ emoji: "👥", text: `Population: ${country.population.toLocaleString()}` });
  if (country?.languages?.length) facts.push({ emoji: "🗣️", text: `Languages: ${country.languages.join(", ")}` });
  if (country?.currencyCode) facts.push({ emoji: "💱", text: `Currency: ${country.currencyCode}` });

  if (wikidata) {
    if (wikidata.capitalLabel?.value) facts.push({ emoji: "📍", text: `Capital (WD): ${wikidata.capitalLabel.value}` });
    if (wikidata.inception?.value) {
      const date = new Date(wikidata.inception.value);
      if (!isNaN(date)) facts.push({ emoji: "📜", text: `Founded: ${date.toLocaleDateString()}` });
    }
    if (wikidata.officialLangLabel?.value) facts.push({ emoji: "📝", text: `Official language: ${wikidata.officialLangLabel.value}` });
    if (wikidata.anthemLabel?.value) facts.push({ emoji: "🎵", text: `Anthem: ${wikidata.anthemLabel.value}` });
    if (wikidata.mottoLabel?.value) facts.push({ emoji: "✒️", text: `Motto: ${wikidata.mottoLabel.value}` });
  }

  if (wikipedia?.extract) {
    const text = wikipedia.extract.length > 220 ? wikipedia.extract.slice(0,220) + "…" : wikipedia.extract;
    facts.push({ emoji: "📚", text });
  }

  while (facts.length < 3) facts.push({ emoji: "✨", text: "Interesting fact coming soon." });

  return (
    <div className="card">
      <div className="card-header">Did you know?</div>
      <div className="card-body">
        <ul className="fact-list">
          {facts.slice(0,6).map((f,i)=>(
            <li key={i}><span className="fact-icon">{f.emoji}</span> {f.text}</li>
          ))}
        </ul>
        {wikipedia?.content_urls?.desktop?.page && (
          <a href={wikipedia.content_urls.desktop.page} target="_blank" rel="noreferrer" className="more-link">Read more on Wikipedia →</a>
        )}
      </div>
    </div>
  );
}
