import { useState } from "react";
import "./App.css";
import { cards } from "./cards";
import { supabase } from "./supabase";

export default function App() {
  const [screen, setScreen] = useState("deck");
  const [card, setCard] = useState(null);
  const [email, setEmail] = useState("");
  const [savedCards, setSavedCards] = useState([]);

  const drawCard = () => {
    setCard(null);
    setScreen("shuffling");

    setTimeout(() => {
      const random = Math.floor(Math.random() * cards.length);
      setCard(cards[random]);
      setScreen("card");
    }, 1200);
  };

  const goDeck = () => {
    setScreen("deck");
    setCard(null);
  };

  const loadPersonalDeck = async () => {
    const { data } = await supabase
      .from("saved_cards")
      .select("*")
      .order("created_at", { ascending: false });

    setSavedCards(data || []);
    setScreen("personal");
  };

  const saveCard = async () => {
    const { error } = await supabase.from("saved_cards").insert([
      {
        email: email,
        card_voice: card.voice,
        card_text: card.text,
      },
    ]);

    if (error) {
      alert("Save failed");
      console.error(error);
      return;
    }

    setEmail("");
    setScreen("deck");
  };

  return (
    <div className="app">

      <h1 className="title">THE REBELLION DECK</h1>

      {/* DECK SCREEN */}
      {screen === "deck" && (
        <>
          <div className="intro">
            <p>Tiny acts of courage.</p>
            <p>Unexpected perspective shifts.</p>
            <p>Reminders of who you are.</p>
          </div>

          <div className="deck" onClick={drawCard}>
            TOUCH THE DECK
          </div>

          <button onClick={loadPersonalDeck}>
            Your deck
          </button>
        </>
      )}

      {/* SHUFFLING */}
      {screen === "shuffling" && (
        <div className="deck shuffling">
          Shuffling...
        </div>
      )}

      {/* CARD VIEW */}
      {screen === "card" && card && (
        <>
          <div className="card">
            <div className="card-voice">{card.voice}</div>
            <div className="card-text">{card.text}</div>
          </div>

          <div className="controls">
            <button onClick={drawCard}>
              What else do I need to see?
            </button>

            <button onClick={saveCard}>
              Save this card
            </button>

            <button onClick={goDeck}>
              Back
            </button>
          </div>
        </>
      )}

      {/* PERSONAL DECK — FAN VIEW */}
      {screen === "personal" && (
        <div className="personal-deck">

          <h2>Your Deck</h2>

          <p className="personal-message">
            These are the patterns you’ve been returning to.
          </p>

          <button onClick={goDeck}>Back</button>

          {savedCards.length === 0 && (
            <p>No cards yet. Your deck is still becoming itself.</p>
          )}

          <div className="fan">
            {savedCards.map((c, i) => (
              <div
                key={i}
                className="fan-card"
                style={{
                  transform: `rotate(${(i - savedCards.length / 2) * 6}deg)`,
                  zIndex: i,
                }}
              >
                <div className="card-voice">{c.card_voice}</div>
                <div className="card-text">{c.card_text}</div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}