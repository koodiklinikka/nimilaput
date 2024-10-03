function handleImage(file, element) {
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target) {
        element.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  } else {
    alert("Please drop an image file.");
  }
}

function handleUpload(event) {
  event.preventDefault();
  const element = event.target.parentElement.querySelector("img");
  handleImage(event.target.files[0], element);
}

const handleDrop = (e) => {
  e.preventDefault();
  const element = e.currentTarget;
  const file = e.dataTransfer.files[0];
  handleImage(file, element);
};

const handleDragOver = (e) => {
  e.stopPropagation();
  e.preventDefault();
};

function slideCardIn(node) {
  node.animate(
    [
      { opacity: 0, transform: "translateY(-10%)" },
      { opacity: 1, transform: "" },
    ],
    {
      duration: 200,
      fill: "both",
      easing: "ease-out",
    },
  );
}

function slideCardOut(node) {
  return new Promise((resolve) => {
    const anim = node.animate(
      [
        { opacity: 1, transform: "" },
        { opacity: 0, transform: "translateY(40%)" },
      ],
      {
        duration: 200,
        fill: "both",
        easing: "ease-in",
      },
    );
    anim.onfinish = resolve;
  });
}

function addCard() {
  const laput = document.querySelector(".laput");
  const template = document.querySelector("#lappu-template");
  const lisalappuButton = document.querySelector(".lisalappu");
  const clone = template.content.firstElementChild.cloneNode(true);
  return laput.insertBefore(clone, lisalappuButton);
}

const handleClickAdd = () => {
  const node = addCard();
  slideCardIn(node);
};

async function handleYeet(event) {
  const lappu = event.target.closest(".lappu");
  if (lappu) {
    await slideCardOut(lappu);
    lappu.parentNode.removeChild(lappu);
    event.preventDefault();
  }
}

const handleBoot = () => {
  addCard();
  document.querySelector(".hakulappu").hidden = !window.crypto.subtle;
};
