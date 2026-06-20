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
  const rememberedEmail = email || localStorage.getItem("rebellion_email");

  if (!rememberedEmail) {
    alert("Save a card first so the deck knows which Evidence to show.");
    return;
  }

  const { data, error } = await supabase
    .from("saved_cards")
    .select("*")
    .eq("email", rememberedEmail)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    alert("Could not load Evidence");
    return;
  }

  setEmail(rememberedEmail);
  setSavedCards(data || []);
  setScreen("evidence");
};

 const saveCard = async () => {
  if (!card || !email) {
    alert("Email required");
    return;
  }

  // check duplicates
  const { data: existing } = await supabase
    .from("saved_cards")
    .select("*")
    .eq("email", email)
    .eq("card_voice", card.voice)
    .eq("card_text", card.text)
    .limit(1);

  if (existing && existing.length > 0) {
    alert("This card is already in your evidence.");
    return;
  }

  // insert new card
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

localStorage.setItem("rebellion_email", email);
setCard(null);
setScreen("evidence");
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

  <div className="card-comment">
    Well… that’s awkwardly accurate.
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

    {/* CARD PREVIEW (forces teal + correct shape) */}
    <div className="card">
      <div className="card-voice">{card.voice}</div>
      <div className="card-text">{card.text}</div>
    </div>

    <p className="save-text">
      Add this card to your evidence. This is how your pattern forms.
    </p>

    <input
      type="email"
      placeholder="Your email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />

    <div className="controls">
      <button onClick={saveCard}>
        Add to evidence
      </button>

      <button onClick={() => setScreen("card")}>
        Back
      </button>
    </div>

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