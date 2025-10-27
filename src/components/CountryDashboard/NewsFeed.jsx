import React from "react";

/**
 * Props:
 * - articles: array from newsdata.io (may be empty)
 */
export default function NewsFeed({ articles = [] }) {
  return (
    <div className="card">
      <div className="card-header">Top News</div>
      <div className="card-body news-body">
        {(!articles || articles.length === 0) && (
          <div className="muted" style={{ padding: '20px', textAlign: 'center' }}>
            📰 No recent news available
          </div>
        )}
        {articles.slice(0,4).map((a, i) => {
          const title = a.title || "Untitled";
          const description = a.description || (a.content ? a.content.slice(0,120) + "..." : "No description available");
          const date = a.pubDate ? new Date(a.pubDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : "";
          
          return (
            <a 
              key={i} 
              className="news-item" 
              href={a.link || "#"} 
              target="_blank" 
              rel="noreferrer"
              onClick={(e) => {
                if (!a.link || a.link === "#") {
                  e.preventDefault();
                }
              }}
            >
              <div className="news-thumb">
                {a.image_url ? (
                  <img src={a.image_url} alt={title} onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="no-thumb">📰</div>';
                  }} />
                ) : (
                  <div className="no-thumb">📰</div>
                )}
              </div>
              <div className="news-info">
                <h4>{title}</h4>
                <p>{description}</p>
                {date && <div className="muted small">🕒 {date}</div>}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}