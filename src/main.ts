// Importera nödvändiga CSS-filer och typer
import "bootstrap/dist/css/bootstrap.css";
import "./style.css";
import { GodisResponse, GodisPost, formDataTyp } from "./bortakvall.types";
import { sendFormDataToApi } from "./postapi";
import { fetchData } from "./fetchdata";
import { fetchedData } from "./fetchdata";
export { formData };

// Här samlar vi alla variabler somm behövs och de vi hämtat med DOM
const numberofproducts =
  document.querySelector<HTMLDivElement>(".numberofproducts")!;
const container = document.querySelector<HTMLDivElement>(".godis-container")!;
const infotext = document.querySelector<HTMLDivElement>(
  "#exampleModalCenter > div > div > div.modal-body-.text-black"
);
const infotitle = document.querySelector<HTMLElement>("#exampleModalLabel");
const varukorg = document.querySelector<HTMLElement>("#offcanvasRight > ul")!;
const cashtotal = document.querySelector<HTMLElement>("#cashtotal");
const btncandycounter =
  document.querySelector<HTMLButtonElement>("#btncandycounter");
const btntrash = document.querySelector(".btn-trash");
const btntrashid = document.querySelector("#btntrashid");
const candyCounterHtml =
  document.querySelector<HTMLSpanElement>("#candycounterHtml")!;
const checkouttotal = document.querySelector<HTMLDivElement>("#checkouttotal");
const btncheckout = document.querySelector("#btnkassa");
const btnshopmore = document.querySelector("body > div.confirmpage > button");
const removebuypage = document.querySelector("#removebuypage");
const orderinfo = document.querySelector<HTMLElement>(".orderinfo");
let varukorgArray: GodisPost[] = [];
const divbuypage = document.querySelector<HTMLDivElement>(".buypage");
const formOrder = document.getElementById("formOrder");
export const confirmpage = document.querySelector<HTMLElement>(".confirmpage");
export const confirmpage2 =
  document.querySelector<HTMLElement>(".confirmpage2");
let totalItemTotal = 0;
let formData: formDataTyp,
  {} = {};
let totalQty: number;

// Funktion för att uppdatera varukorgens innehåll
function updateVarukorgDisplay() {
  varukorg.innerHTML = varukorgArray
    .map((item) => {
      //hittar godiset som matchar id i fetchedData och det godiset vi har lagt till.
      const candy = fetchedData?.find((candy) => candy.id === item.product_id);
      // om candy id och product id matchar så skapar vi en produkt i varukorgen.
      if (candy) {
        return `<li><img class="korg-bild rounded-circle" src="https://www.bortakvall.se/${
          candy.images.large
        }" alt="Godis"> <strong>${candy.name}</strong> ${
          item.item_price
        } kr <span class="removebild">Antal: ${item.qty} Totalt ${
          item.item_price * item.qty
        } kr <img class="removebild" id="${
          candy.id
        }" src="./remove.svg"></span><hr></li>`;
      }
      return alert("No candy"); // Hantera fallet där godis inte hittas
    })
    .join("");
  //beräknar den totala summan i item_total vilket är summan av allt godis i varukorgen. Sedan adderas den totala summan ihop och visas i varukorgen.
  totalItemTotal = varukorgArray.reduce(
    (accumulator, currentItem) => accumulator + currentItem.item_total,
    0
  );
  cashtotal!.innerHTML = `<strong>TOTAL ${totalItemTotal} kr</strong>`;
}

// Funktion för att uppdatera orderinformationen
function updateOrderInfo() {
  // Uppdatera innehållet i HTML-elementet på köpsidan
  checkouttotal!.innerHTML = `Totalt ordervärde ${totalItemTotal} kr`;
  //kollar igenom vad som finns i varukorgarray och skriver ut dessa på köpsidan.
  orderinfo!.innerHTML = varukorgArray
    .map(
      (item) =>
        `<li><img class="korg-bild rounded-circle" src="https://www.bortakvall.se/${
          fetchedData.find((candy) => candy.id === item.product_id)!.images
            .large
        }" alt="Card image cap"><strong> ${
          fetchedData.find((candy) => candy.id === item.product_id)!.name
        } ${item.item_price} kr</strong> Antal: ${item.qty} Totalt: ${
          item.item_price * item.qty
        } kr<hr></li>`
    )
    .join("");
}

// Funktion för att hantera köpknapptryck
function buyButtonClick(index: number) {
  // Kontrollera att index är giltigt och att fetchedData innehåller tillräckligt med element
  if (index >= 0 && index < fetchedData.length) {
    const candy = fetchedData[index];

    //kollar så att vi har fått tillbaka fetchedData[index]. Om vi inte fått tillbaka så ska koden inte köras.
    if (!candy) {
      alert(`Testa ett annat godis`);
      return;
    }
    //letar igenom index i varukorgarray
    const existingItemIndex = varukorgArray.findIndex(
      (item) => item.product_id === candy.id
    );
    let qty = 1;

    //om existingitemindex har hittats så uppdateras varukorgen, annars pushas godiset in i varukorgsarray.
    if (existingItemIndex !== -1) {
      varukorgArray[existingItemIndex].qty += 1;
      varukorgArray[existingItemIndex].item_total =
        varukorgArray[existingItemIndex].qty *
        varukorgArray[existingItemIndex].item_price;
    } else {
      varukorgArray.push({
        product_id: candy.id,
        qty: 1,
        item_price: candy.price,
        item_total: candy.price * qty,
      });
    }

    /*Använder map för att skapa en ny array som innehåller endast kvantiteten (qty) för varje objekt i varukorgArray, 
      och sedan använder reduce för att summera dessa kvantiteter och beräkna den totala kvantiteten. Detta värde tilldelas totalQty.*/
    const totalQty = varukorgArray
      .map((item) => item.qty)
      .reduce((sum, qty) => sum + qty, 0);

    candyCounterHtml.innerText = `${totalQty}`;

    //sparar ner innehållet i varukorgsarray i local storage så godiset finns kvar efter uppdatering.
    localStorage.setItem("varukorg", JSON.stringify(varukorgArray));

    updateVarukorgDisplay();
  } else {
    alert(`Godiset hittades inte`);
  }
}

// Rendera ut datan för varje godis i API
async function renderData() {
  try {
    await fetchData();

    //Kollar om vi har hämtat godiset från API:et
    if (!fetchedData) {
      alert("Godiset är slut. Lageruppfyllnad pågår");
      return;
    }

    // Filtrera produkter med stock_status === "instock"
    const inStockProducts = fetchedData.filter(
      (candy) => candy.stock_status === "instock"
    );

    // Antalet produkter med stock_status === "instock". Och skriver ut hur många vi har i lager på sidan.
    const numberOfInStockProducts = inStockProducts.length;
    numberofproducts.innerText = `Visar ${fetchedData.length} produkter. Antal produkter i lager: ${numberOfInStockProducts}`;

    //skapar cards för varje godis som hämtats
    container.innerHTML = fetchedData
      //sorterar godiset i bokstavsordning
      .sort((a, b) => {
        return a.name.localeCompare(b.name, "sv");
      })

      .map((candy, index) => {
        //Hittar godis i array där godiset är slut i lager.
        const isOutOfStock = candy.stock_status === "outofstock";
        //renderar ut på sidan och skapar ett card med rätt pris, namn och om det är i lager eller inte
        const cardHTML = `
      <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3 my-2">
        <img class="card-img-top p-1 card-background rounded-bottom img-fluid rounded-circle shadow" src="https://www.bortakvall.se/${
          candy.images.large
        }" alt="Godis">
        <div class="card-body card-background text-black p-2 rounded-bottom">
          <h6 class="card-title">${candy.name}</h6>
          <p class="card-text">${candy.price} kr</p>
          <button class="btn btn-info putInVarukorgButton" ${
            isOutOfStock ? "disabled" : ""
          }>
            ${isOutOfStock ? "Slut i rutan" : "Lägg i varukorg"}
          </button>    
          <button
            type="button"
            class="btn btn-primary float-end godisInfo"
            data-bs-toggle="modal"
            data-bs-target="#exampleModalCenter"
            id="${index}"
          >
            Mer info
          </button>
        </div>
      </div>
    `;
        return cardHTML;
      })
      .join("");

    // Lägg till eventlyssnare för info
    const infoButtons = document.querySelectorAll(".godisInfo");
    infoButtons.forEach((button, index) => {
      button.addEventListener("click", () => showInfoModal(fetchedData[index]));
    });

    // Lägg till eventlyssnare för köpknappar i varukorgen
    const buyButtons = document.querySelectorAll(".putInVarukorgButton");
    buyButtons.forEach((button, index) => {
      button.addEventListener("click", () => buyButtonClick(index));
    });

    // Hämta varukorgen från lokal lagring och uppdatera visningen
    const storedVarukorg = localStorage.getItem("varukorg");
    varukorgArray.length = 0;
    if (storedVarukorg) {
      varukorgArray.push(...JSON.parse(storedVarukorg));
    }

    // Uppdatera varukorgsvisningen och antalet i kundvagnsikonen
    updateVarukorgDisplay();

    //Uppdaterar antal godis i räknaren som finns nere till höger på startsidan.
    totalQty = varukorgArray
      .map((item) => item.qty)
      .reduce((sum, qty) => sum + qty, 0);
    candyCounterHtml.innerText = `${totalQty}`;
  } catch (error) {
    console.error(`Ett fel uppstod:`, error);
  }
} //slut på funktionen render data

// Funktion för att visa modal med information om godiset
function showInfoModal(candy: GodisResponse) {
  // om lagersaldo är 0 så ska 0 skrivas ut istället för null
  if (candy.stock_quantity === null) {
    candy.stock_quantity = 0;
  }
  //om index är definierad ska infotext visas till rätt godis.
  if (candy) {
    infotext!.innerHTML = `<img class="card-img-top p-2 bg-white rounded-top w-25" src="https://www.bortakvall.se/${candy.images.thumbnail}" alt="Bild på godis"><p>${candy.description} Lagerantal: ${candy.stock_quantity}.</p> `;
  }
  infotitle!.innerHTML = `${candy.name}`;
}

// Funktion för att hämta formulärvärden
function getFormValues(): formDataTyp {
  const firstName = (document.getElementById("firstName") as HTMLInputElement)
    .value;
  const lastName = (document.getElementById("lastName") as HTMLInputElement)
    .value;
  const address = (document.getElementById("address") as HTMLInputElement)
    .value;
  const postalCode = (document.getElementById("postalCode") as HTMLInputElement)
    .value;
  const city = (document.getElementById("city") as HTMLInputElement).value;
  const phone = (document.getElementById("phone") as HTMLInputElement).value;
  const email = (document.getElementById("email") as HTMLInputElement).value;

  // Spara formulärvärden i formData-objektet. Detta används för att spara datan i en variabel som senare kommer att skickas till API:et
  return (formData = {
    customer_first_name: firstName,
    customer_last_name: lastName,
    customer_address: address,
    customer_postcode: postalCode,
    customer_city: city,
    customer_email: email,
    customer_phone: phone,
    order_total: totalItemTotal,
    order_items: varukorgArray,
  });
}

// Lägg till eventlyssnare för att skicka beställningen till api
formOrder!.addEventListener("submit", async (e) => {
  e.preventDefault();
  getFormValues();
  updateOrderInfo();
  await sendFormDataToApi(formData);
});

// eventlyssnare för att uppdatera knappen vid sidofältet. Om varukorgen är tom så ska det inte gå att gå till kassan.
btncandycounter!.addEventListener("click", () => {
  if (varukorgArray.length <= 0) {
    btncheckout?.setAttribute("disabled", "");
    btntrashid?.setAttribute("disabled", "");
  } else {
    btncheckout?.removeAttribute("disabled");
    btntrashid?.removeAttribute("disabled");
  }
});

// eventlyssnare för att uppdatera orderinfo och visa köpsidan
btncheckout!.addEventListener("click", () => {
  updateOrderInfo();
  divbuypage?.classList.remove("d-none");
});

// eventlyssnare för att tömma varukorgen
btntrash!.addEventListener("click", () => {
  varukorgArray.length = 0;
  btntrashid?.setAttribute("disabled", "");
  btncheckout?.setAttribute("disabled", "");
  updateVarukorgDisplay();
  candyCounterHtml.innerText = "0";
  localStorage.removeItem("varukorg");
});

// eventlyssnare för att gömma köpsidan när köparen vill fortsätta handla
removebuypage!.addEventListener("click", () => {
  divbuypage?.classList.add("d-none");
});

// Lägg till eventlyssnare för att logga klick i varukorgen
varukorg.addEventListener("click", (e) => {
  //Hämta det klickade godisets id
  if (e.target) {
    let clickedProductId = (e.target as HTMLElement).getAttribute("id");

    // Hitta index av objektet med matchande id
    let indexToRemove = varukorgArray.findIndex(
      (product) => String(product.product_id) === clickedProductId
    );

    // Kolla om objektet hittades
    if (indexToRemove !== -1) {
      // Ta bort objektet från varukorgsarrayn
      varukorgArray.splice(indexToRemove, 1);
      totalQty = varukorgArray
        .map((item) => item.qty)
        .reduce((sum, qty) => sum + qty, 0);
      candyCounterHtml.innerText = `${totalQty}`;
      localStorage.setItem("varukorg", JSON.stringify(varukorgArray));
      updateVarukorgDisplay();
      updateOrderInfo();
      //om innehållet i varukorgarray är 0 eller mindre så ska man inte kunna trycka på gå till kassan och tömma varukorgen.
      if (varukorgArray.length <= 0) {
        btncheckout?.setAttribute("disabled", "");
        btntrash?.setAttribute("disabled", "");
      } else {
        btncheckout?.removeAttribute("disabled");
        btntrash?.removeAttribute("disabled");
      }
    }
  }
});

// Lägg till eventlyssnare för att återställa allt och gömma köpsidan
btnshopmore!.addEventListener("click", () => {
  candyCounterHtml.innerText = "0";
  localStorage.removeItem("varukorg");
  confirmpage?.classList.add("d-none");
  divbuypage?.classList.add("d-none");
  varukorgArray.length = 0;
  btncheckout?.setAttribute("disabled", "");
  updateVarukorgDisplay();
});

// Rendera ut all data så att kunden når allt godis direkt.
renderData();
