import { useEffect, useState } from "react";
import "./App.css";
import { cards } from "./cards";
import { supabase } from "./supabase";

const SHUFFLE_LINES = [
  "Consulting the chaos...",
  "Looking for something annoyingly relevant...",
  "Interrupting your overthinking...",
  "Gathering evidence...",
  "One moment while the deck becomes nosy...",
  "Your brain called. The deck answered instead.",
];

export default function App() {
  const [screen, setScreen] = useState("home");
  const [card, setCard] = useState(null);
  const [email, setEmail] = useState("");
  const [savedCards, setSavedCards] = useState([]);
  const [shuffleText, setShuffleText] = useState("");

  // 🧠 load remembered email once
  useEffect(() => {
    const savedEmail = localStorage.getItem("rebellion_email");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const drawCard = () => {
    setCard(null);
    setScreen("shuffling");

    let i = 0;
    const interval = setInterval(() => {
      setShuffleText(SHUFFLE_LINES[i % SHUFFLE_LINES.length]);
      i++;
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      const random = Math.floor(Math.random() * cards.length);
      setCard(cards[random]);
      setScreen("card");
    }, 1600);
  };

  const goHome = () => {
    setScreen("home");
    setCard(null);
  };

  const goEvidence = async () => {
    if (!email) {
      setScreen("save");
      return;
    }

    const { data, error } = await supabase
      .from("saved_cards")
      .select("*")
      .eq("email", email)
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      alert("Could not load Evidence");
      return;
    }

    setSavedCards(data || []);
    setScreen("evidence");
  };

  const saveCard = async () => {
  if (!email) {
    setScreen("save");
    return;
  }

  localStorage.setItem("rebellion_email", email);

  const { error } = await supabase.from("saved_cards").insert([
    {
      email: email,
      card_voice: card.voice,
      card_text: card.text,
    },
  ]);

  if (error) {
    console.error(error);
    alert("Save failed");
    return;
  }

  setScreen("home");
  setCard(null);
};

  const reuseEmail = () => {
    const savedEmail = localStorage.getItem("rebellion_email");
    if (savedEmail) setEmail(savedEmail);
  };

  return (
    <div className="app">

      <h1 className="title">THE REBELLION DECK</h1>

      {/* HOME */}
      {screen === "home" && (
        <>
          <div className="intro">
            <p>The deck has opinions today.</p>
          </div>

          <div className="deck" onClick={drawCard}>
            SHOW ME
          </div>

          <button onClick={goEvidence}>
            Evidence
          </button>
        </>
      )}

      {/* SHUFFLING */}
      {screen === "shuffling" && (
        <div className="deck shuffling">
          {shuffleText}
        </div>
      )}

      {/* CARD */}
      {screen === "card" && card && (
        <>
          <div className="card">
            <div className="card-voice">{card.voice}</div>
            <div className="card-text">{card.text}</div>

            <div className="reaction">
              Well, that's awkwardly accurate.
            </div>
          </div>

          <div className="controls">
            <button onClick={drawCard}>
              Another perspective
            </button>

            <button onClick={() => setScreen("save")}>
  This landed
</button>

            <button onClick={goHome}>
              Back
            </button>
          </div>
        </>
      )}

      {/* SAVE (EMAIL ONLY FIRST TIME) */}
      {screen === "save" && card && (
        <div className="save-screen">

          <div className="card-preview">
            <div className="card-voice">{card.voice}</div>
            <div className="card-text">{card.text}</div>
          </div>

          <p className="save-text">
            Add it to Evidence so you can find it again later.
          </p>

          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button onClick={saveCard}>
            Add to Evidence
          </button>

        </div>
      )}

      {/* EVIDENCE */}
      {screen === "evidence" && (
        <div className="personal-deck">

          <h2>Evidence</h2>

          <p className="personal-message">
            You've been collecting clues.
          </p>

          <button onClick={goHome}>Back</button>

          {savedCards.length === 0 && (
            <p>No evidence yet. The story is just starting.</p>
          )}

          {savedCards.map((c, i) => (
            <div key={i} className="saved-card">
              <div className="card-voice">{c.card_voice}</div>
              <div className="card-text">{c.card_text}</div>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}