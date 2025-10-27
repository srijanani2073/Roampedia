// import React, { useEffect, useState } from "react";
// import "./NewsFeed.css";

// const NewsFeed = () => {
//   const [articles, setArticles] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchNews = async () => {
//       try {
//         const response = await fetch(
//           `https://newsdata.io/api/1/news?apikey=pub_9eeba8abf7fc48a681df8f921c969433&country=in&language=en&category=top`
//         );
//         const data = await response.json();
//         setArticles(data.results || []);
//       } catch (error) {
//         console.error("Error fetching news:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchNews();
//   }, []);

//   return (
//     <div className="news-card">
//       <h2>📰 Latest News</h2>
//       {loading ? (
//         <p>Loading news...</p>
//       ) : (
//         <div className="news-list">
//           {articles.slice(0, 8).map((article, index) => (
//             <div key={index} className="news-item">
//               {article.image_url && (
//                 <img src={article.image_url} alt={article.title} />
//               )}
//               <div className="news-content">
//                 <h3>{article.title}</h3>
//                 <p>{article.description || "No description available."}</p>
//                 <a
//                   href={article.link}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   Read more →
//                 </a>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default NewsFeed;
import React, { useEffect, useState } from "react";
import "./NewsFeed.css";

const NewsFeed = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState("in");
  const [category, setCategory] = useState("top");
  const [language, setLanguage] = useState("en");

  // Transaction form (News Interest)
  const [interest, setInterest] = useState("");
  const [savedInterests, setSavedInterests] = useState([]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://newsdata.io/api/1/news?apikey=pub_9eeba8abf7fc48a681df8f921c969433&country=${country}&language=${language}&category=${category}`
      );
      const data = await response.json();
      setArticles(data.results || []);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [country, category, language]);

  const handleInterestSubmit = (e) => {
    e.preventDefault();
    if (interest.trim() !== "") {
      setSavedInterests([...savedInterests, interest]);
      setInterest("");
    }
  };

  return (
    <div className="news-card">
      <h2>📰 Live News Feed</h2>

      {/* Filter Section */}
      <div className="filter-bar">
        <select value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="in">India</option>
          <option value="us">USA</option>
          <option value="uk">UK</option>
          <option value="jp">Japan</option>
          <option value="au">Australia</option>
        </select>

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="top">Top</option>
          <option value="business">Business</option>
          <option value="sports">Sports</option>
          <option value="technology">Technology</option>
          <option value="entertainment">Entertainment</option>
          <option value="science">Science</option>
          <option value="world">World</option>
        </select>

        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>

        <button onClick={fetchNews}>Search</button>
      </div>

      {/* News List */}
      {loading ? (
        <p>Loading news...</p>
      ) : (
        <div className="news-list">
          {articles.slice(0, 8).map((article, index) => (
            <div key={index} className="news-item">
              {article.image_url && (
                <img src={article.image_url} alt={article.title} />
              )}
              <div className="news-content">
                <h3>{article.title}</h3>
                <p>{article.description || "No description available."}</p>
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read more →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transaction Form: News Interest */}
      <div className="news-interest-form">
        <h3>🗒️ Save News Interests</h3>
        <form onSubmit={handleInterestSubmit}>
          <input
            type="text"
            placeholder="Enter a news topic or keyword"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
          />
          <button type="submit">Add Interest</button>
        </form>
        <ul>
          {savedInterests.map((topic, i) => (
            <li key={i}>• {topic}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NewsFeed;
