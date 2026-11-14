/* VERAM — demo catalogue.
   Client's official custom collection assets generated to match exact streetwear styles. */
(function () {
  window.VERAM = {
    currency: "₹",
    freeShipAt: 1999,
    whatsapp: "910000000000", // TODO: client WhatsApp number (country code, no +)
    instagram: "veram.clothing",

    products: [
      { id: "karna", name: "Karna — Unbroken", cat: "mythic", colour: "Jet Black", swatch: "#141210", price: 1299, tag: "Hero piece",
        img: "assets/img/karna-hero.jpg", pos: "50% 30%", featured: true,
        desc: "Full-back print of Karna at the chariot wheel. French terry, oversized cut." },
      { id: "hope", name: "Hope — Krishna", cat: "mythic", colour: "Sky Blue", swatch: "#8fc3ec", price: 1199, tag: "Chest print",
        img: "assets/img/hope-product.jpg", pos: "50% 35%",
        desc: "'HOPE' with a peacock feather on the chest. French terry, oversized cut." },
      { id: "tiger", name: "Challenge Limits — Tiger", cat: "mindset", colour: "Forest Black", swatch: "#1e211b", price: 1099, tag: "Front + back",
        img: "assets/img/tiger-product.jpg", pos: "50% 35%",
        desc: "'The limit does not exist' on the front. A tiger looking forward on the back." },
      { id: "focus-black", name: "Focus — Summit", cat: "mindset", colour: "Jet Black", swatch: "#111", price: 999, tag: "Chest print",
        img: "assets/img/focus-black-product.jpg", pos: "50% 35%",
        desc: "Gold FOCUS wordmark with mountain line art on the chest." },
      { id: "focus-bone", name: "Focus — Core", cat: "essentials", colour: "Bone", swatch: "#e9dcc2", price: 899, tag: "Minimal",
        img: "assets/img/focus-bone-product.jpg", pos: "50% 35%",
        desc: "Clean FOCUS wordmark with a gold 'O'. The everyday essential." },
      { id: "murali", name: "Murali — Signature", cat: "essentials", colour: "Mint", swatch: "#8fdcd0", price: 899, tag: "Minimal",
        img: "assets/img/murali-product.jpg", pos: "50% 35%",
        desc: "Hand-script signature with a single peacock feather. Quiet, but it says enough." }
    ],

    // inches — from the client's size chart
    sizes: [
      { size: "S", fits: 40, length: 27, chest: 19.8, full: 39.6 },
      { size: "M", fits: 41, length: 27, chest: 20.5, full: 41.0 },
      { size: "L", fits: 42, length: 29, chest: 21.2, full: 42.4 },
      { size: "XL", fits: 46, length: 29, chest: 23.0, full: 46.0 },
      { size: "XXL", fits: 47, length: 31, chest: 23.3, full: 46.6 }
    ],

    // Client's real Instagram reels — shown with Instagram's official embed (real thumbnails)
    reels: [
      { url: "https://www.instagram.com/reel/DfuCWblTwqj/", title: "Karna — back view" },
      { url: "https://www.instagram.com/reel/Dfpjh_bzOxV/", title: "Jackson tee" },
      { url: "https://www.instagram.com/reel/DfbSFFAIREE/", title: "Drop 01" },
      { url: "https://www.instagram.com/reel/DfVHCrYTYoJ/", title: "Drop 01" },
      { url: "https://www.instagram.com/reel/DfTTOn4IOHR/", title: "Drop 01" },
      { url: "https://www.instagram.com/reel/DfSgMYEzgsi/", title: "Wear your vibe" },
      { url: "https://www.instagram.com/reel/DfPvkBgzxQ0/", title: "Wear your vibe" }
    ]
  };
})();
