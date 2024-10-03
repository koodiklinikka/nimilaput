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

const handleAdd = () => {
  const laput = document.querySelector(".laput");
  const template = document.querySelector("#lappu-template");
  const lisalappuButton = document.querySelector(".lisalappu");
  const clone = template.content.cloneNode(true);
  laput.insertBefore(clone, lisalappuButton);
};

const handleYeet = (event) => {
  const lappu = event.target;
  if (lappu.classList.contains("lappu")) {
    lappu.parentNode.removeChild(lappu);
    event.preventDefault();
  }
};

const handleBoot = () => {
  handleAdd();
};
