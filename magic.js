let magicProm = null;

function toBase64(buffer) {
  const buf = new Uint8Array(buffer);
  return btoa(String.fromCharCode(...buf));
}

function fromBase64(str) {
  return Uint8Array.from([...atob(str)].map((c) => c.charCodeAt(0)));
}

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  return await crypto.subtle.digest("SHA-256", msgBuffer);
}

async function aesCbcDecrypt(base64Bytes, key) {
  const decKey = await crypto.subtle.importKey("raw", key, "AES-CBC", true, [
    "decrypt",
  ]);
  const fullBuf = fromBase64(base64Bytes);
  const iv = fullBuf.slice(0, 16);
  const ciphertext = fullBuf.slice(16);
  return crypto.subtle.decrypt({ name: "AES-CBC", iv }, decKey, ciphertext);
}

async function loadMagic() {
  if (!magicProm) {
    magicProm = fetch("./magic.json")
      .then((r) => {
        if (!r.ok) {
          throw new Error(`Failed to load magic.json`);
        }
        return r.json();
      })
      .then((data) => new Map(data));
  }
  return magicProm;
}

async function doSearch(search) {
  const res = [];
  const db = await loadMagic();
  const ents = db.get(toBase64(await sha256("kk2024~" + search)));
  if (!ents) return [];
  let decKeyBits = new Array(search.length).fill(search).join("x");
  const decKey = await sha256(decKeyBits);
  for (const ent of ents) {
    const plain = new TextDecoder().decode(await aesCbcDecrypt(ent, decKey));
    const json = JSON.parse(plain);
    if (json.im) {
      json.im = json.im.replace("^se", "https://avatars.slack-edge.com/");
    }
    res.push(json);
  }
  return res;
}

function handleAddFromSearchResult(event) {
  event.preventDefault();
  const { im, rn, dn } = event.target.dataset;
  const el = addCard();
  el.querySelector(".username").innerText = dn ? `@${dn}` : "???";
  el.querySelector(".nimi").innerText = rn || "???";
  if (im) el.querySelector("img").src = im;
  slideCardIn(el);
}

function rand(a, b) {
  return a + Math.random() * (b - a);
}

async function handleSearch(event) {
  const search = event.target.value.trim().toLowerCase();
  document.getElementById("hakutulokset").innerHTML = "";
  if (!search) return;
  let results = await doSearch(search);
  let i = 0;
  for (const { im, rn, dn } of results) {
    const el = document.createElement("a");
    Object.assign(el.dataset, { im, rn, dn });
    el.innerText = [rn, dn].filter(Boolean).join(" / ");
    el.onclick = handleAddFromSearchResult;
    el.href = "#";
    el.classList.add("hakutulos");
    document.getElementById("hakutulokset").appendChild(el);
    let transform = `rotate(${rand(-90, 90)}deg) translate(${rand(-50, 50)}%, ${rand(-50, 50)}%)`;
    el.animate(
      [
        { opacity: 0, transform },
        { opacity: 1, transform: "" },
      ],
      {
        duration: 300,
        delay: i++ * 150,
        fill: "both",
        easing: "ease-out",
      },
    );
  }
}
