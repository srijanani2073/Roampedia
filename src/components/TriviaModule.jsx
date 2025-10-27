import React, { useEffect, useMemo, useRef, useState } from "react";
import "./TriviaModule.css";

/**
 * TriviaModule.jsx
 * Single-file module containing:
 * - TriviaModule (main wrapper)
 * - ConfigPanel
 * - AboutPanel
 * - GameView
 * - EndScreen
 *
 * Uses REST Countries API: https://restcountries.com/v3.1/all
 *
 * Notes:
 * - Difficulty population thresholds:
 *   Easy: > 20,000,000
 *   Medium: > 5,000,000
 *   Hard: > 150,000
 *   Expert: no threshold
 */

const REGIONS = [
  { id: "Africa", label: "Africa" },
  { id: "Asia", label: "Asia" },
  { id: "Americas", label: "Americas" },
  { id: "Europe", label: "Europe" },
  { id: "Oceania", label: "Oceania" },
  { id: "World", label: "The World" },
];

const DIFFICULTIES = [
  { id: "easy", label: "Easy (20,000,000+)", minPop: 20000000 },
  { id: "medium", label: "Medium (5,000,000+)", minPop: 5000000 },
  { id: "hard", label: "Hard (150,000+)", minPop: 150000 },
  { id: "expert", label: "Expert (All)", minPop: 0 },
];

const COUNTRIES_PER_GAME = 5;
const QUESTIONS_PER_COUNTRY = 3;
const POINTS_PER_QUESTION = 5;
const BONUS_PER_COUNTRY = 5;

function TriviaModule() {
  const [stage, setStage] = useState("config"); // config | about | playing | end
  const [region, setRegion] = useState("World");
  const [difficulty, setDifficulty] = useState("hard");
  const [allCountries, setAllCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [gameSeed, setGameSeed] = useState(null); // to force new game
  const [gameResults, setGameResults] = useState(null); // for end screen

  useEffect(() => {
    // Fetch countries once
    const fetchCountries = async () => {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all");
        const json = await res.json();
        // Normalize shape into needed fields
        const normalized = json.map((c) => ({
          cca3: c.cca3,
          name: c.name?.common || "",
          region: c.region || "",
          population: c.population || 0,
          capital: Array.isArray(c.capital) && c.capital.length ? c.capital[0] : "",
          flags: (c.flags && (c.flags.svg || c.flags.png)) || "",
        }));
        setAllCountries(normalized);
      } catch (err) {
        console.error("Error loading countries:", err);
      }
    };

    fetchCountries();
  }, []);

  // Update filteredCountries whenever allCountries, region or difficulty change
  useEffect(() => {
    if (!allCountries.length) return;

    const diffObj = DIFFICULTIES.find((d) => d.id === difficulty) || DIFFICULTIES[2];
    const minPop = diffObj.minPop;

    let pool = allCountries.filter((c) => {
      // Must have population and capital for our quiz rules
      if (!c.population || !c.capital) return false;
      // Region filtering
      if (region !== "World") {
        return c.region === region && c.population >= minPop;
      }
      return c.population >= minPop;
    });

    // If a region yields too few entries for the chosen difficulty,
    // fallback to wider world (but we still leave UI to indicate disabling).
    setFilteredCountries(pool);
  }, [allCountries, region, difficulty]);

  useEffect(() => {
    // if user changes config, reset any previous game seed/results
    setGameSeed(null);
    setGameResults(null);
  }, [region, difficulty]);

  const startGame = () => {
    // create a new seed (timestamp) so GameView re-inits
    setGameSeed(Date.now());
    setStage("playing");
  };

  const gotoAbout = () => setStage("about");
  const gotoConfig = () => setStage("config");

  return (
    <div className="trivia-module">
      <div className="trivia-header">
        <h2>🌍 Country Trivia</h2>
        <p className="sub">Test your knowledge of flags, capitals and population.</p>
      </div>

      {stage === "config" && (
        <ConfigPanel
          region={region}
          setRegion={setRegion}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          filteredCountries={filteredCountries}
          startGame={startGame}
          gotoAbout={gotoAbout}
        />
      )}

      {stage === "about" && <AboutPanel gotoConfig={gotoConfig} startGame={startGame} />}

      {stage === "playing" && gameSeed && (
        <GameView
          key={gameSeed}
          region={region}
          difficulty={difficulty}
          allCountries={allCountries}
          filteredCountries={filteredCountries}
          onFinish={(results) => {
            setGameResults(results);
            setStage("end");
          }}
          onAbort={() => setStage("config")}
        />
      )}

      {stage === "end" && gameResults && (
        <EndScreen
          results={gameResults}
          replaySame={() => {
            setGameSeed(Date.now());
            setStage("playing");
          }}
          replayNew={() => {
            setStage("config");
            setGameSeed(null);
            setGameResults(null);
          }}
          gotoHome={() => setStage("config")}
        />
      )}
    </div>
  );
}

/* ============================
   ConfigPanel
   ============================ */
function ConfigPanel({ region, setRegion, difficulty, setDifficulty, filteredCountries, startGame, gotoAbout }) {
  // Determine availability of difficulties per region (to disable some if pool too small)
  const availCountsByDiff = useMemo(() => {
    const results = {};
    DIFFICULTIES.forEach((d) => {
      // For each difficulty, count how many countries exist in the selected region that meet minPop and have capital+population
      results[d.id] = filteredCountForDifficulty(d, region);
    });
    return results;

    function filteredCountForDifficulty(diff, region) {
      // This function will attempt to approximate availability by re-fetching same API constraints.
      // We'll check via a direct call to restcountries to avoid dependence on outer `filteredCountries`.
      // For simplicity and speed we rely on 'filteredCountries' passed in: it already matches chosen difficulty & region.
      // But this helper expects global knowledge; to avoid complexity we just use the provided filteredCountries length for current difficulty.
      // Caller already computes that; this function will be used only to show disabled states for select options when region is Oceania.
      return null;
    }
  }, [region, filteredCountries]);

  // Simpler approach: compute whether Oceania has enough countries for easy/medium
  const oceaniaCountByDifficulty = useMemo(() => {
    // We'll fetch locally from restcountries via quick filter of the page (we don't have direct pool here)
    // But to keep simple: check global window.__countries if present else assume small.
    // To keep UI correct we disable easy/medium for Oceania based on description.
    return {
      easyDisabled: region === "Oceania",
      mediumDisabled: region === "Oceania",
    };
  }, [region]);

  // If filteredCountries has fewer than COUNTRIES_PER_GAME, disable start
  const notEnoughCountries = filteredCountries.length < COUNTRIES_PER_GAME;

  return (
    <div className="config-panel card">
      <div className="config-row">
        <div>
          <label>Region</label>
          <div className="select-row">
            {REGIONS.map((r) => (
              <button
                key={r.id}
                className={`option-btn ${region === r.id ? "selected" : ""}`}
                onClick={() => setRegion(r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label>Difficulty</label>
          <div className="select-row">
            {DIFFICULTIES.map((d) => {
              const disabled = (d.id === "easy" || d.id === "medium") && region === "Oceania";
              return (
                <button
                  key={d.id}
                  className={`option-btn ${difficulty === d.id ? "selected" : ""}`}
                  onClick={() => !disabled && setDifficulty(d.id)}
                  disabled={disabled}
                  title={disabled ? "Not enough countries in Oceania for this mode" : undefined}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="config-actions">
        <button className="btn-outline" onClick={gotoAbout}>
          About
        </button>

        <button
          className="btn-primary"
          onClick={startGame}
          disabled={notEnoughCountries}
          title={notEnoughCountries ? "Not enough countries match your filters" : "Start game"}
        >
          Play Now
        </button>
      </div>

      <p className="helper">
        {filteredCountries.length} countries available for chosen region/difficulty. You will be asked about {COUNTRIES_PER_GAME} random countries.
      </p>
    </div>
  );
}

/* ============================
   AboutPanel
   ============================ */
function AboutPanel({ gotoConfig, startGame }) {
  return (
    <div className="about-panel card">
      <h3>About the Game</h3>
      <p>
        You will be quizzed on countries. For each of {COUNTRIES_PER_GAME} countries you will answer 3 questions:
      </p>
      <ol>
        <li>Which country is shown by the flag? (multiple choice)</li>
        <li>What is the capital? (text input)</li>
        <li>What is the population? (multiple choice)</li>
      </ol>

      <p>
        Scoring: <strong>{POINTS_PER_QUESTION} points</strong> per correct answer. If you get all 3 questions right for a country you earn a <strong>{BONUS_PER_COUNTRY}-point bonus</strong>.
      </p>

      <p>
        Countries are filtered by region and difficulty (population thresholds). Countries without a capital or population are excluded.
      </p>

      <div className="config-actions">
        <button className="btn-outline" onClick={gotoConfig}>Back</button>
        <button className="btn-primary" onClick={startGame}>Continue to Game</button>
      </div>
    </div>
  );
}

/* ============================
   GameView
   ============================ */
function GameView({
  region,
  difficulty,
  allCountries,
  filteredCountries,
  onFinish,
  onAbort,
}) {
  // Build a pool using region and difficulty (safety check)
  const diffObj = DIFFICULTIES.find((d) => d.id === difficulty) || DIFFICULTIES[2];
  const minPop = diffObj.minPop;

  const pool = useMemo(() => {
    if (!allCountries.length) return [];
    return allCountries.filter((c) => {
      if (!c.population || !c.capital) return false;
      if (region !== "World") return c.region === region && c.population >= minPop;
      return c.population >= minPop;
    });
  }, [allCountries, region, minPop]);

  // If pool too small, abort to config
  useEffect(() => {
    if (pool.length < COUNTRIES_PER_GAME) {
      // small delay so user sees a message briefly
      // But as per instruction, don't do background waiting; we'll immediately call onAbort
      onAbort();
    }
  }, [pool, onAbort]);

  // Select N random countries (without replacement)
  const selectedCountries = useMemo(() => {
    const copy = [...pool];
    shuffleArray(copy);
    return copy.slice(0, COUNTRIES_PER_GAME);
  }, [pool]);

  // Game state
  const [countryIndex, setCountryIndex] = useState(0); // 0..COUNTRIES_PER_GAME-1
  const [questionIndex, setQuestionIndex] = useState(0); // 0..2 (flag, capital, population)
  const [score, setScore] = useState(0);
  // keep per-country correct count to award bonus
  const [correctForCountry, setCorrectForCountry] = useState(0);

  // For feedback display when wrong
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  // For final aggregation
  const resultsRef = useRef([]);
  useEffect(() => {
    resultsRef.current = [];
  }, []);

  const capsInputRef = useRef(null);

  // When question changes and it's capital question, autofocus
  useEffect(() => {
    if (questionIndex === 1) {
      // on next tick focus the input if present
      setTimeout(() => {
        capsInputRef.current?.focus();
        // on mobile scroll: ensure bottom visible
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }, 80);
    }
  }, [questionIndex, countryIndex]);

  const currentCountry = selectedCountries[countryIndex];

  // helpers to build choices
  function makeFlagChoices(correctName) {
    // pick 3 other random country names from pool (excluding correct)
    const others = selectedCountries
      .map((c) => c.name)
      .filter((n) => n !== correctName);

    // If not enough from selectedCountries, use global pool
    let extraPool = pool.map((c) => c.name).filter((n) => n !== correctName && !others.includes(n));
    const choices = [...others];
    while (choices.length < 3 && extraPool.length) {
      shuffleArray(extraPool);
      choices.push(extraPool.pop());
    }
    // ensure we have 3 distractors; if still less, duplicate with safe fallback
    while (choices.length < 3) choices.push("Unknown");

    const full = shuffleArray([correctName, ...choices.slice(0, 3)]);
    return full;
  }

  function makePopulationChoices(correctPop) {
    // Ratios as described: [0.5, 0.75, 1, 1.25, 1.5]
    const ratios = [0.5, 0.75, 1, 1.25, 1.5];
    const all = ratios.map((r) => Math.round(correctPop * r));
    // We'll take the middle three [0.75,1,1.25] so that correct is included and options ascend
    const slice = all.slice(1, 4);
    // Format with commas
    return slice.map((n) => n);
  }

  const handleSubmitChoice = (isCorrect, selectedVal = null) => {
    setSelectedOption(selectedVal);
    setLastAnswerCorrect(isCorrect);
    if (isCorrect) {
      setScore((s) => s + POINTS_PER_QUESTION);
      setCorrectForCountry((c) => c + 1);
    }
    // move to next question after 800ms
    setTimeout(() => {
      advanceQuestion();
    }, 800);
  };

  const handleCapitalSubmit = (typed) => {
    const correct = currentCountry.capital.trim();
    const normalized = normalizeString(typed || "");
    const normalizedCorrect = normalizeString(correct);
    const isCorrect = normalized === normalizedCorrect && normalized !== "";
    handleSubmitChoice(isCorrect, typed);
  };

  function advanceQuestion() {
    setSelectedOption(null);
    setLastAnswerCorrect(null);
    if (questionIndex + 1 < QUESTIONS_PER_COUNTRY) {
      setQuestionIndex((q) => q + 1);
    } else {
      // completed 3 questions for current country
      // award bonus if correctForCountry === 3
      let bonusAwarded = 0;
      if (correctForCountry === QUESTIONS_PER_COUNTRY) {
        bonusAwarded = BONUS_PER_COUNTRY;
        setScore((s) => s + BONUS_PER_COUNTRY);
      }

      // store results for end screen
      resultsRef.current.push({
        country: currentCountry,
        correctAnswers: correctForCountry,
        bonusAwarded,
      });

      // reset per-country correct
      setCorrectForCountry(0);

      if (countryIndex + 1 < selectedCountries.length) {
        setCountryIndex((i) => i + 1);
        setQuestionIndex(0);
      } else {
        // finished entire game
        onFinish({
          totalScore: score + (bonusAwarded || 0), // NOTE: score has already been incremented for the bonus above
          details: [...resultsRef.current],
        });
      }
    }
  }

  if (!currentCountry) {
    return <div className="card info">Preparing game...</div>;
  }

  // Build UI content for current question
  if (questionIndex === 0) {
    // Flag multiple choice
    const choices = makeFlagChoices(currentCountry.name);
    return (
      <div className="card game-card">
        <div className="game-top">
          <div className="progress">Country {countryIndex + 1} / {selectedCountries.length}</div>
          <div className="score">Score: {score}</div>
        </div>

        <h3 className="question-title">Which country does this flag belong to?</h3>
        <div className="flag-wrap">
          {currentCountry.flags ? (
            <img src={currentCountry.flags} alt="flag" className="flag-img" />
          ) : (
            <div className="flag-placeholder">No flag</div>
          )}
        </div>

        <div className="answers-grid">
          {choices.map((choice, idx) => {
            const isCorrect = choice === currentCountry.name;
            const appliedClass =
              selectedOption === choice
                ? lastAnswerCorrect
                  ? "correct"
                  : "wrong"
                : "";
            return (
              <button
                key={idx}
                className={`answer-btn ${appliedClass}`}
                onClick={() => handleSubmitChoice(isCorrect, choice)}
                disabled={!!selectedOption}
              >
                {choice}
              </button>
            );
          })}
        </div>

        {lastAnswerCorrect === false && (
          <p className="feedback">Wrong — correct: <strong>{currentCountry.name}</strong></p>
        )}
      </div>
    );
  }

  if (questionIndex === 1) {
    // Capital — text input
    return (
      <div className="card game-card">
        <div className="game-top">
          <div className="progress">Country {countryIndex + 1} / {selectedCountries.length}</div>
          <div className="score">Score: {score}</div>
        </div>

        <h3 className="question-title">What is the capital of {currentCountry.name}?</h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const val = e.target.elements.capital?.value || "";
            handleCapitalSubmit(val);
            e.target.reset();
          }}
        >
          <input
            ref={capsInputRef}
            name="capital"
            type="text"
            placeholder="Type capital and press Enter"
            className="text-input"
            autoFocus
            autoComplete="off"
            disabled={!!selectedOption}
          />
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={!!selectedOption}>
              Submit
            </button>
          </div>
        </form>

        {lastAnswerCorrect === false && (
          <p className="feedback">Wrong — correct: <strong>{currentCountry.capital}</strong></p>
        )}
      </div>
    );
  }

  // questionIndex === 2 : population multiple choice
  if (questionIndex === 2) {
    const pops = makePopulationChoices(currentCountry.population);
    // Format numbers with commas
    const fmt = (n) => n.toLocaleString();

    return (
      <div className="card game-card">
        <div className="game-top">
          <div className="progress">Country {countryIndex + 1} / {selectedCountries.length}</div>
          <div className="score">Score: {score}</div>
        </div>

        <h3 className="question-title">Which is closest to {currentCountry.name}'s population?</h3>
        <div className="answers-grid">
          {pops.map((p, i) => {
            const isCorrect = p === Math.round(currentCountry.population);
            const appliedClass =
              selectedOption === p
                ? lastAnswerCorrect
                  ? "correct"
                  : "wrong"
                : "";
            return (
              <button
                key={i}
                className={`answer-btn ${appliedClass}`}
                onClick={() => handleSubmitChoice(isCorrect, p)}
                disabled={!!selectedOption}
              >
                {fmt(p)}
              </button>
            );
          })}
        </div>

        {lastAnswerCorrect === false && (
          <p className="feedback">Wrong — correct: <strong>{currentCountry.population.toLocaleString()}</strong></p>
        )}
      </div>
    );
  }

  return null;
}

/* ============================
   EndScreen
   ============================ */
function EndScreen({ results, replaySame, replayNew, gotoHome }) {
  // compute final score (results.totalScore already set in onFinish)
  const score = results.totalScore ?? 0;

  // high score handling
  const HS_KEY = "roampedia_trivia_highscore";
  const [high, setHigh] = useState(() => {
    try {
      const raw = localStorage.getItem(HS_KEY);
      return raw ? parseInt(raw, 10) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    if (score > high) {
      try {
        localStorage.setItem(HS_KEY, String(score));
        setHigh(score);
      } catch {
        // ignore
      }
    }
  }, [score, high]);

  const shareText = `I just scored ${score} points in the Country Quiz Challenge! Can you do better? https://cjcon90.github.io/country-quiz/`;

  return (
    <div className="card end-card">
      <h3>🏁 Game Complete</h3>
      <p className="final-score">Your score: <strong>{score}</strong></p>
      <p className="high-score">High score: <strong>{high}</strong></p>

      {score === 100 && <p className="perfect">🎉 Perfect score! Amazing!</p>}
      {score > high && <p className="new-high">✨ New high score!</p>}

      <div className="end-actions">
        <button className="btn-primary" onClick={replaySame}>Play Again (same filters)</button>
        <button className="btn-outline" onClick={replayNew}>Choose New Settings</button>
        <button className="btn-ghost" onClick={gotoHome}>Return to Menu</button>
      </div>

      <div className="share-row">
        <a
          className="share-link"
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Share on Twitter
        </a>
        <a
          className="share-link"
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://cjcon90.github.io/country-quiz/")}&quote=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Share on Facebook
        </a>
      </div>

      <hr />

      <div className="details">
        <h4>Per-country summary</h4>
        <ul>
          {results.details && results.details.map((d, i) => (
            <li key={i}>
              <strong>{d.country.name}</strong> — correct answers: {d.correctAnswers}/3 {d.bonusAwarded ? " (+bonus)" : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ============================
   Utilities
   ============================ */

function shuffleArray(arr) {
  // Fisher-Yates
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function normalizeString(str) {
  // remove diacritics, trim, lowercase
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]|_/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export default TriviaModule;
