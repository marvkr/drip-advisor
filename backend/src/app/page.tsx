"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const USER_ID = "demo-user-1";

type WardrobeItem = {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  extracted_image_url: string;
  tryon_image_url: string | null;
};

type Outfit = {
  id: string;
  name: string;
  occasion: string | null;
  generated_image_url: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

// ── API helpers ──
async function api(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
  return res.json();
}

function fileToBase64(file: File): Promise<string> {
  // Send raw bytes — server converts HEIC/PNG/WebP to JPEG via sharp
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      resolve(btoa(binary));
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// ── Main App ──
export default function Home() {
  const [tab, setTab] = useState<"wardrobe" | "outfits" | "agent">("wardrobe");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showTryOn, setShowTryOn] = useState<string | null>(null);

  // Load avatar on mount — dismiss onboarding if already set
  useEffect(() => {
    const stored = localStorage.getItem("drip_avatar_url");
    if (stored) {
      setAvatarUrl(stored);
      setShowOnboarding(false);
    }
  }, []);

  const handleAvatarSet = (url: string) => {
    setAvatarUrl(url);
    localStorage.setItem("drip_avatar_url", url);
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:items-center md:justify-center">
      {/* iPhone frame wrapper */}
      <div className="relative">
        {/* Side buttons (decorative, desktop only) */}
        <div className="hidden md:block absolute -left-[3px] top-[128px] w-[3px] h-8 bg-zinc-600 rounded-full z-10" />
        <div className="hidden md:block absolute -left-[3px] top-[176px] w-[3px] h-8 bg-zinc-600 rounded-full z-10" />
        <div className="hidden md:block absolute -right-[3px] top-[144px] w-[3px] h-14 bg-zinc-600 rounded-full z-10" />

        <div className="flex flex-col h-screen w-full md:h-[844px] md:w-[390px] md:rounded-[54px] md:border-[14px] md:border-zinc-700 md:overflow-hidden md:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_40px_100px_rgba(0,0,0,0.9)] relative">
          {/* Notch */}
          <div className="hidden md:flex absolute top-0 left-1/2 -translate-x-1/2 w-[126px] h-[34px] bg-zinc-700 rounded-b-[22px] z-20 items-center justify-center gap-2 pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-zinc-900" />
            <div className="w-12 h-1.5 rounded-full bg-zinc-900" />
          </div>
          {/* Home indicator */}
          <div className="hidden md:block absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-zinc-500 rounded-full z-10 pointer-events-none" />

          {/* Header */}
          <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 md:pt-[46px]">
            <h1 className="text-lg font-bold tracking-tight">DripAdvisor</h1>
            <button
              onClick={() => setShowOnboarding(true)}
              className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden ring-2 ring-zinc-700"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              )}
            </button>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            {tab === "wardrobe" && (
              <WardrobeTab
                avatarUrl={avatarUrl}
                onSetup={() => setShowOnboarding(true)}
                onTryOn={(id) => setShowTryOn(id)}
              />
            )}
            {tab === "outfits" && <OutfitsTab avatarUrl={avatarUrl} />}
            {tab === "agent" && <AgentTab />}
          </main>

          {/* Tab Bar */}
          <nav className="flex border-t border-zinc-800 bg-zinc-950 md:pb-6">
            {(["wardrobe", "outfits", "agent"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${
                  tab === t ? "text-white" : "text-zinc-500"
                }`}
              >
                {t === "agent" ? "Style AI" : t}
              </button>
            ))}
          </nav>

          {/* Modals */}
          {showOnboarding && (
            <OnboardingModal
              onClose={() => setShowOnboarding(false)}
              onAvatarSet={handleAvatarSet}
            />
          )}
          {showTryOn && avatarUrl && (
            <TryOnModal
              avatarUrl={avatarUrl}
              itemId={showTryOn}
              onClose={() => setShowTryOn(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Wardrobe Tab ──
function WardrobeTab({
  avatarUrl,
  onSetup,
  onTryOn,
}: {
  avatarUrl: string | null;
  onSetup: () => void;
  onTryOn: (id: string) => void;
}) {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const load = useCallback(() => {
    api(`/api/wardrobe/list?user_id=${USER_ID}`)
      .then((d) => setItems(d.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setAdding(true);
      try {
        const base64 = await fileToBase64(file);
        const d = await api("/api/wardrobe/add", {
          method: "POST",
          body: JSON.stringify({ image: base64, user_id: USER_ID, name: file.name.split(".")[0] }),
        });
        setItems((prev) => [d.item, ...prev]);
      } catch (e) {
        alert("Failed to add item");
      } finally {
        setAdding(false);
      }
    };
    input.click();
  };

  if (!avatarUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <svg className="w-16 h-16 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        <p className="text-lg font-semibold">Set up your avatar first</p>
        <p className="text-sm text-zinc-500 text-center">Upload a photo so we can show you wearing any outfit</p>
        <button onClick={onSetup} className="mt-2 px-6 py-3 bg-white text-black rounded-full font-semibold text-sm">
          Set Up Avatar
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="relative h-full">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 p-8">
          <svg className="w-12 h-12 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          <p className="font-semibold">Your wardrobe is empty</p>
          <p className="text-sm text-zinc-500">Add clothing from screenshots or photos</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 p-3">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onTryOn(item.id)}
              className="bg-zinc-900 rounded-xl overflow-hidden text-left hover:ring-1 hover:ring-zinc-600 transition-all"
            >
              <img src={item.extracted_image_url} alt={item.name} className="w-full aspect-[3/4] object-cover bg-zinc-800" />
              <div className="p-2">
                <p className="text-sm font-medium truncate">{item.name}</p>
                {item.brand && <p className="text-xs text-zinc-500 truncate">{item.brand}</p>}
                <p className="text-[10px] text-zinc-600 uppercase mt-0.5">{item.category}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      {/* FAB */}
      <button
        onClick={handleAdd}
        disabled={adding}
        className="absolute bottom-4 right-4 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
      >
        {adding ? (
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        )}
      </button>
    </div>
  );
}

// ── Outfits Tab ──
function OutfitsTab({ avatarUrl }: { avatarUrl: string | null }) {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [selectedTop, setSelectedTop] = useState<WardrobeItem | null>(null);
  const [selectedBottom, setSelectedBottom] = useState<WardrobeItem | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api(`/api/outfits/list?user_id=${USER_ID}`)
      .then((d) => setOutfits(d.outfits))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openBuilder = async () => {
    setShowBuilder(true);
    setSelectedTop(null);
    setSelectedBottom(null);
    const d = await api(`/api/wardrobe/list?user_id=${USER_ID}`);
    setItems(d.items);
  };

  const generate = async () => {
    if (!selectedTop || !selectedBottom || !avatarUrl) return;
    setGenerating(true);
    try {
      const d = await api("/api/outfit/generate", {
        method: "POST",
        body: JSON.stringify({
          avatar_url: avatarUrl,
          top_id: selectedTop.id,
          bottom_id: selectedBottom.id,
          user_id: USER_ID,
          name: `${selectedTop.name} + ${selectedBottom.name}`,
        }),
      });
      setOutfits((prev) => [d.outfit, ...prev]);
      setShowBuilder(false);
    } catch {
      alert("Failed to generate outfit");
    } finally {
      setGenerating(false);
    }
  };

  const tops = items.filter((i) => ["top", "shirt", "tee", "jacket", "hoodie", "sweater", "blouse", "outerwear"].some((c) => i.category.toLowerCase().includes(c)));
  const bottoms = items.filter((i) => ["bottom", "pants", "jeans", "shorts", "skirt", "trousers"].some((c) => i.category.toLowerCase().includes(c)));

  if (loading) return <div className="flex items-center justify-center h-full"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="relative h-full">
      {outfits.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 p-8">
          <svg className="w-12 h-12 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          <p className="font-semibold">No outfits yet</p>
          <p className="text-sm text-zinc-500">Combine a top + bottom to create your first outfit</p>
          <button onClick={openBuilder} className="mt-2 px-6 py-3 bg-white text-black rounded-full font-semibold text-sm">
            Build Outfit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 p-3">
          {outfits.map((o) => (
            <div key={o.id} className="bg-zinc-900 rounded-xl overflow-hidden">
              <img src={o.generated_image_url} alt={o.name} className="w-full aspect-[3/4] object-cover bg-zinc-800" />
              <div className="p-2">
                <p className="text-sm font-medium truncate">{o.name}</p>
                {o.occasion && <p className="text-xs text-zinc-500">{o.occasion}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {outfits.length > 0 && (
        <button onClick={openBuilder} className="absolute bottom-4 right-4 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
      )}

      {/* Builder Modal */}
      {showBuilder && (
        <div className="absolute inset-0 bg-black/90 z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <button onClick={() => !generating && setShowBuilder(false)} className="text-zinc-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <p className="font-semibold">Build Outfit</p>
            <div className="w-6" />
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Avatar with garment overlays */}
            {avatarUrl && (
              <div className="relative w-[180px] h-[280px] mx-auto rounded-xl overflow-hidden bg-zinc-900">
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                {selectedTop && (
                  <img
                    src={selectedTop.extracted_image_url}
                    alt="top"
                    className="absolute object-contain pointer-events-none"
                    style={{ top: '8%', left: '10%', width: '80%', height: '38%' }}
                  />
                )}
                {selectedBottom && (
                  <img
                    src={selectedBottom.extracted_image_url}
                    alt="bottom"
                    className="absolute object-contain pointer-events-none"
                    style={{ top: '42%', left: '10%', width: '80%', height: '38%' }}
                  />
                )}
              </div>
            )}

            <div>
              <p className="text-sm font-semibold mb-2">Select a Top</p>
              {tops.length === 0 ? <p className="text-xs text-zinc-500">No tops in wardrobe</p> : (
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth px-[calc(50%-3rem)]">
                  {tops.map((item) => (
                    <button key={item.id} onClick={() => setSelectedTop(item)} className={`flex-shrink-0 w-20 rounded-xl overflow-hidden border-2 snap-center transition-all ${selectedTop?.id === item.id ? "border-white scale-105" : "border-transparent opacity-60"}`}>
                      <img src={item.extracted_image_url} className="w-full aspect-[3/4] object-cover bg-zinc-800" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold mb-2">Select a Bottom</p>
              {bottoms.length === 0 ? <p className="text-xs text-zinc-500">No bottoms in wardrobe</p> : (
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth px-[calc(50%-3rem)]">
                  {bottoms.map((item) => (
                    <button key={item.id} onClick={() => setSelectedBottom(item)} className={`flex-shrink-0 w-20 rounded-xl overflow-hidden border-2 snap-center transition-all ${selectedBottom?.id === item.id ? "border-white scale-105" : "border-transparent opacity-60"}`}>
                      <img src={item.extracted_image_url} className="w-full aspect-[3/4] object-cover bg-zinc-800" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={generate}
              disabled={!selectedTop || !selectedBottom || generating}
              className="w-full py-4 bg-white text-black rounded-full font-semibold disabled:opacity-30"
            >
              {generating ? "Generating..." : selectedTop && selectedBottom ? "Generate Polished Look" : "Select a top & bottom"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Agent Tab ──
function AgentTab() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: "" };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setStreaming(true);

    try {
      const chatMessages = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatMessages, user_id: USER_ID }),
      });
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === "assistant") last.content += chunk;
          return updated;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === "assistant") last.content = "Sorry, something went wrong.";
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-2 p-8">
          <svg className="w-10 h-10 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>
          <p className="font-semibold text-lg">DripAdvisor</p>
          <p className="text-sm text-zinc-500">Ask me what to wear for any occasion</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === "user" ? "ml-auto bg-white text-black" : "bg-zinc-900 text-white"}`}>
              {m.content || (streaming ? "..." : "")}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}
      <div className="flex gap-2 p-3 border-t border-zinc-800">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="What should I wear tonight?"
          disabled={streaming}
          className="flex-1 bg-zinc-900 text-white rounded-full px-4 py-2.5 text-sm outline-none placeholder:text-zinc-600 disabled:opacity-50"
        />
        <button
          onClick={send}
          disabled={!input.trim() || streaming}
          className="w-9 h-9 bg-white text-black rounded-full flex items-center justify-center disabled:opacity-30"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
        </button>
      </div>
    </div>
  );
}

// ── Onboarding Modal ──
function OnboardingModal({ onClose, onAvatarSet }: { onClose: () => void; onAvatarSet: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const d = await api("/api/avatar/upload", {
        method: "POST",
        body: JSON.stringify({ image: base64, user_id: USER_ID }),
      });
      onAvatarSet(d.avatar_url);
    } catch {
      alert("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6">
      <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      {preview ? (
        <img src={preview} alt="preview" className="w-48 h-64 rounded-2xl object-cover bg-zinc-800" />
      ) : (
        <div className="w-48 h-64 rounded-2xl bg-zinc-900 flex items-center justify-center">
          <svg className="w-20 h-20 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </div>
      )}

      {uploading ? (
        <div className="mt-8"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mt-6">Set Up Your Avatar</h2>
          <p className="text-sm text-zinc-500 text-center mt-2">Stand at a slight angle with arms relaxed.<br />This photo will be used for all virtual try-ons.</p>
          <label className="mt-6 px-6 py-3 bg-white text-black rounded-full font-semibold text-sm cursor-pointer hover:bg-zinc-200 transition-colors">
            Upload Photo
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
          </label>
        </>
      )}
    </div>
  );
}

// ── Try-On Modal ──
function TryOnModal({ avatarUrl, itemId, onClose }: { avatarUrl: string; itemId: string; onClose: () => void }) {
  const [tryonUrl, setTryonUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api("/api/tryon/generate", {
      method: "POST",
      body: JSON.stringify({ avatar_url: avatarUrl, item_id: itemId, user_id: USER_ID }),
    })
      .then((d) => setTryonUrl(d.tryon_image_url))
      .catch(() => setError("Failed to generate try-on"))
      .finally(() => setLoading(false));
  }, [avatarUrl, itemId]);

  return (
    <div className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center">
      <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-zinc-800/80 rounded-full flex items-center justify-center text-white z-10">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      {loading && (
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500">Generating your look...</p>
        </div>
      )}
      {error && <p className="text-red-400">{error}</p>}
      {tryonUrl && <img src={tryonUrl} alt="Try-on result" className="max-h-full max-w-full object-contain" />}
    </div>
  );
}
