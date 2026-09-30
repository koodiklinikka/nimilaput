let emojiDataProm = null;

async function loadEmojiData() {
  if (!emojiDataProm) {
    emojiDataProm = fetch("./emoji-data.json")
      .then((r) => {
        if (!r.ok) {
          throw new Error(`Failed to load emoji-data.json`);
        }
        return r.json();
      })
      .then((data) => {
        // Running total of combinations for weighted random picking
        let total = 0;
        const cumulative = data.combos.map(([, , rights]) => {
          total += rights.length / 2;
          return total;
        });
        return { ...data, cumulative, total };
      })
      .catch((e) => {
        emojiDataProm = null;
        throw e;
      });
  }
  return emojiDataProm;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function notoEmojiUrl(cp) {
  // The Noto CDN wants each codepoint zero-padded to 4 digits (e.g. "00a9")
  const path = cp
    .split("-")
    .map((c) => c.padStart(4, "0"))
    .join("_");
  return `https://fonts.gstatic.com/s/e/notoemoji/latest/${path}/512.png`;
}

function kitchenPath(cp) {
  return "u" + cp.replaceAll("-", "-u");
}

function randomKitchenUrl({ prefix, emoji, dates, combos, cumulative, total }) {
  const n = Math.floor(Math.random() * total);
  let lo = 0;
  let hi = cumulative.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cumulative[mid] > n) hi = mid;
    else lo = mid + 1;
  }
  const [leftIdx, dateIdx, rights] = combos[lo];
  const offset = n - (lo > 0 ? cumulative[lo - 1] : 0);
  const rightIdx = parseInt(rights.substr(offset * 2, 2), 36);
  const left = kitchenPath(emoji[leftIdx]);
  const right = kitchenPath(emoji[rightIdx]);
  return `${prefix}${dates[dateIdx]}/${left}/${left}_${right}.png`;
}

async function handleRandomEmoji(event, kind) {
  event.preventDefault();
  const img = event.target.closest(".lappu").querySelector("figure img");
  const data = await loadEmojiData();
  let src;
  if (kind === "kitchen") {
    src = randomKitchenUrl(data);
  } else if (kind === "kk") {
    src = data.kkPrefix + randomChoice(data.kk);
  } else {
    src = notoEmojiUrl(randomChoice(data.emoji));
  }
  setCardImage(img, src, { emoji: true });
}
